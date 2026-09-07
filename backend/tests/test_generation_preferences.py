"""Run with python -m unittest discover -s backend/tests from repository root."""
import unittest
import uuid
from unittest.mock import AsyncMock, patch

from pydantic import ValidationError

from app.core.config import Settings
from app.schemas.project import BriefIn
from app.schemas.site import parse_site
from app.services.ai.orchestrator import GenerationOrchestrator
from app.services.ai.providers import YandexCopywriter, YandexLayoutEngine


def brief(**changes):
    return BriefIn.model_validate({
        "site_type": "landing", "style": "business", "brand_name": "Forma",
        "description": "Архитектурная студия", "goal": "portfolio", **changes,
    })


def settings():
    return Settings(_env_file=None, yandex_api_key="", yandex_folder_id="", s3_access_key="")


class PreferencesTests(unittest.IsolatedAsyncioTestCase):
    async def test_old_brief_still_generates_valid_site(self):
        source = brief(layout=None)
        self.assertEqual(source.preferences.design_direction, "auto")
        site = await GenerationOrchestrator(settings()).generate(source, uuid.uuid4())
        self.assertEqual(parse_site(site.model_dump()), site)

    async def test_all_directions_and_formats_produce_valid_json(self):
        for site_type in ("landing", "shop", "multipage", "crm"):
            for direction in ("minimal", "editorial", "bold", "warm"):
                with self.subTest(site_type=site_type, direction=direction):
                    source = brief(site_type=site_type, preferences={"design_direction": direction, "features": ["gallery", "leads"]})
                    site = await GenerationOrchestrator(settings()).generate(source, uuid.uuid4())
                    self.assertEqual(parse_site(site.model_dump()), site)
                    all_types = {section.type for page in site.pages for section in page.sections}
                    self.assertTrue({"gallery", "lead_form"}.issubset(all_types))

    async def test_manual_choices_override_creative_direction_and_features(self):
        source = brief(preferences={"design_direction": "minimal", "features": ["catalog"]}, layout={
            "mode": "manual", "blocks": [{"type": "faq", "variant": "plain"}],
            "density": "compact", "hero_variant": "overlay",
        })
        plan = await YandexLayoutEngine(settings()).plan_layout(source)
        self.assertEqual(plan["sections"], [{"type": "faq", "variant": "plain"}])
        self.assertEqual(plan["axes"]["density"], "compact")
        self.assertEqual(plan["hero_variant"], "overlay")

    async def test_empty_manual_structure_is_respected(self):
        plan = await YandexLayoutEngine(settings()).plan_layout(brief(layout={"mode": "manual", "blocks": []}))
        self.assertEqual(plan["sections"], [])

    async def test_explicit_choices_override_valid_model_output(self):
        engine = YandexLayoutEngine(settings())
        engine.mock = False
        engine._call_real_api = AsyncMock(return_value={"primary_color": "#FFFFFF", "sections": [{"type": "faq", "variant": "plain"}], "axes": {"density": "compact"}})
        source = brief(style="custom", custom_hex_color="#123456", preferences={"design_direction": "minimal", "features": ["catalog", "leads"]})
        plan = await engine.plan_layout(source)
        self.assertEqual(plan["primary_color"], "#123456")
        self.assertEqual(plan["axes"]["density"], "airy")
        self.assertTrue({"catalog_filter", "lead_form"}.issubset({s["type"] for s in plan["sections"]}))

    async def test_business_and_goal_change_fallback_structure(self):
        plan = await YandexLayoutEngine(settings()).plan_layout(brief(goal="booking", preferences={"industry": "Кофейня"}))
        self.assertTrue({"catalog_filter", "gallery", "lead_form", "faq"}.issubset({s["type"] for s in plan["sections"]}))

    async def test_context_reaches_both_model_prompts(self):
        source = brief(preferences={"industry": "Архитектура", "audience": "Семьи", "tone": "expert", "avoid": "Неон"})
        with patch("app.services.ai.providers._call_yandex_completion", new_callable=AsyncMock, return_value="{}") as completion:
            await YandexLayoutEngine(settings())._call_real_api(source)
            self.assertIn('"audience": "Семьи"', completion.call_args.args[2])
            await YandexCopywriter(settings())._call_real_api(source, ["hero"])
            self.assertIn('"avoid": "Неон"', completion.call_args.args[2])

    def test_unknown_features_are_rejected(self):
        with self.assertRaises(ValidationError):
            brief(preferences={"features": ["execute_arbitrary_code"]})


if __name__ == "__main__":
    unittest.main()
