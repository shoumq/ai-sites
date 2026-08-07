import enum


class TariffPlan(str, enum.Enum):
    trial = "trial"
    basic = "basic"
    business = "business"


class SiteType(str, enum.Enum):
    landing = "landing"
    shop = "shop"
    multipage = "multipage"
    crm = "crm"


class StylePreset(str, enum.Enum):
    business = "business"
    warm = "warm"
    techno = "techno"
    custom = "custom"


class SiteGoal(str, enum.Enum):
    sales = "sales"
    booking = "booking"
    portfolio = "portfolio"
    info = "info"


class ProjectStatus(str, enum.Enum):
    draft = "draft"
    generating = "generating"
    ready = "ready"
    published = "published"


class GenerationStage(str, enum.Enum):
    writing_copy = "writing_copy"
    building_layout = "building_layout"
    generating_images = "generating_images"
    finishing = "finishing"
    done = "done"
    error = "error"
