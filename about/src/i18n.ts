export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export function localizedPath(locale: Locale, page = "") {
  return locale === "en" ? `/${page}` : `/${locale}/${page}`;
}

const english = {
  langAttr: "en",
  title: "Hangzhou Scooter Technology Co., Ltd. — about.scooter.work",
  description:
    "Hangzhou Scooter Technology Co., Ltd. (Scooter.work), founded in 2024 in Linping, Hangzhou, specializes in cross-border electric scooter operations, visual design, warehousing, and after-sales support.",
  nav: {
    ariaLabel: "Primary navigation",
    home: "Home",
    products: "Products",
    guides: "Guides & tutorials",
    aboutSite: "About",
    stores: "Stores",
    privacy: "Privacy",
    aboutTag: "Company",
    about: "Overview",
    brands: "Online Stores",
    operations: "Operations",
    facilities: "Warehouse & Service",
    partnership: "Partnership",
    contact: "Contact",
    mainSite: "scooter.work",
    guidesSite: "guides.scooter.work",
    languageLabel: "Language",
    menuToggle: "Toggle navigation menu",
  },
  hero: {
    companyName: "Hangzhou Scooter Technology Co., Ltd.",
    companySub: "杭州斯古特科技有限公司",
    headline: "Cross-Border Operations for Electric Scooters",
    summary:
      "Founded in 2024 in Linping, Hangzhou, we are a cross-border e-commerce company focused on electric scooters. Our 12-person team covers visual design, independent store operations, warehousing, logistics, and after-sales service.",
    primaryCta: "Business Inquiries",
    secondaryCta: "Visit scooter.work",
    signAlt: "Hangzhou Scooter Technology Co., Ltd. company signage",
    facts: [
      { value: "2024", label: "Founded" },
      { value: "Hangzhou", label: "Location" },
      { value: "12", label: "Team Size" },
      { value: "EU · NA · AU", label: "Core markets" },
    ],
  },
  overview: {
    title: "Company Overview",
    intro:
      "Backed by our Hangzhou Linping headquarters, our team focuses on self-operated independent stores alongside AliExpress, Amazon, and major marketplaces—coordinating visual merchandising, overseas warehouse fulfillment, cross-border logistics, and local spare-parts support across Europe, North America, and Australia.",
  },
  brands: {
    partnersTitle: "Our Online Stores",
    ownBrandTitle: "Our Brand",
    visitStore: "Visit store",
    partners: [
      {
        name: "KuKirin",
        logo: "/images/kukirin-prime.webp",
        logoClass: "logo-mark",
        href: "https://kukirinprime.com",
        domain: "kukirinprime.com",
        description:
          "An off-road and high-performance electric scooter brand known for high-power dual-motor models, with a strong user base as a mainstream performance brand in Europe.",
      },
      {
        name: "JOYOR",
        logo: "/images/joyorprime.avif",
        logoClass: "logo-wide",
        href: "https://joyorprime.com",
        domain: "joyorprime.com",
        description:
          "An original electric scooter R&D and manufacturing brand focused on all-terrain capability and performance. Core brand of our self-operated DTC stores across Europe.",
      },
      {
        name: "NAVEE",
        logo: "/images/navee.svg",
        logoClass: "logo-wide",
        href: "https://naveescooter.com",
        domain: "naveescooter.com",
        description:
          "Dreame Technology's smart mobility brand launched in 2021 for urban commuting—top three in Europe and sold in over 60 countries and regions.",
      },
    ],
    ownBrand: {
      name: "JOFEN",
      logo: "/images/JOFEN.avif",
      href: "https://jofenscooter.com",
      domain: "jofenscooter.com",
      description:
        "Our retail mobility brand offering practical electric scooters and everyday riding accessories for global riders.",
    },
  },
  operations: {
    title: "Cross-Border Operations",
    summary:
      "We operate self-run independent stores as our primary channel across Europe, North America, and Australia, alongside AliExpress, Amazon, and other platforms.",
    points: [
      {
        title: "Custom Shopify Themes & App Development",
        detail:
          "In-house development of custom storefront themes, Shopify Apps, and extensions beyond native platform limits—such as live inventory display, bulk discounts, operations dashboards, and catalog management to drive storefront conversion and back-office precision.",
      },
      {
        title: "In-House Multi-Store & Automation Tools",
        detail:
          "Custom-built order and shipping cost reconciliation exporters alongside batch AI translation workflows tailored for multi-store, multilingual operations, eliminating manual reconciliation and accelerating multi-market launches.",
      },
    ],
    trophyAlt: "Official Shopify achievement milestone trophy",
    trophyCaption: "Official Shopify achievement milestone trophy",
  },
  facilities: {
    title: "Warehouse & Operations Center",
    photos: [
      { src: "/images/company/scooter-fleet.jpg", caption: "Display & after-sales service fleet" },
      { src: "/images/company/warehouse-racks.jpg", caption: "Inventory shelving & packaging racks" },
      { src: "/images/company/parts-bench.jpg", caption: "After-sales parts & service bench" },
      { src: "/images/company/dispatch-desk.jpg", caption: "Inspection & order dispatch workstation" },
    ],
  },
  partnership: {
    title: "Partnership Models",
    summary:
      "We seek agency and distribution partnerships for electric scooters and accessories, combining our independent stores, marketplaces, local warehousing, and after-sales service to grow brand sales in Europe, North America, and Australia.",
    models: [
      {
        code: "01",
        title: "Brand Agency",
        detail:
          "Regional agency sales and brand promotion across Europe, North America, and Australia, covering dedicated storefronts, localized visual design, and market expansion.",
      },
      {
        code: "02",
        title: "Product Distribution",
        detail:
          "Fast rollout across our self-operated DTC stores, AliExpress, Amazon, and major marketplaces with multilingual catalogs and multi-store inventory sync.",
      },
      {
        code: "03",
        title: "End-to-End Operations",
        detail:
          "One-stop execution covering overseas warehousing, cross-border fulfillment, local after-sales parts and service, performance advertising, and content marketing.",
      },
    ],
  },
  contact: {
    title: "Contact Us",
    company: "Hangzhou Scooter Technology Co., Ltd.",
    address: "Linping District, Hangzhou, Zhejiang, China",
    phoneLabel: "Phone",
    emailLabel: "Email",
    copy: "Copy",
    copied: "Copied",
    footerLinksTitle: "Websites",
    storesTitle: "Stores",
    copyright: "Hangzhou Scooter Technology Co., Ltd.",
  },
};

const chinese: typeof english = {
  langAttr: "zh-CN",
  title: "杭州斯古特科技有限公司 — about.scooter.work",
  description:
    "杭州斯古特科技有限公司成立于 2024 年，总部位于杭州临平，是一家专注于电动滑板车出海的跨境电商企业，具备视觉设计、独立站运营、仓储物流与售后服务的完整出海链路。",
  nav: {
    ariaLabel: "主导航",
    home: "首页",
    products: "产品配件",
    guides: "使用教程",
    aboutSite: "关于我们",
    stores: "官方商店",
    privacy: "隐私政策",
    aboutTag: "公司介绍",
    about: "公司简介",
    brands: "在线商店",
    operations: "跨境运营",
    facilities: "仓库与服务",
    partnership: "合作方式",
    contact: "联系我们",
    mainSite: "scooter.work",
    guidesSite: "教程站",
    languageLabel: "语言切换",
    menuToggle: "展开或收起菜单",
  },
  hero: {
    companyName: "杭州斯古特科技有限公司",
    companySub: "Hangzhou Scooter Technology Co., Ltd.",
    headline: "专注电动滑板车出海的跨境电商企业",
    summary:
      "杭州斯古特科技有限公司成立于 2024 年，总部位于杭州临平。公司团队 12 人，设有运营部、售后部、物流部和视觉设计部，形成了从视觉设计、独立站运营到仓储物流与售后服务的完整出海链路。",
    primaryCta: "联系合作",
    secondaryCta: "访问 scooter.work",
    signAlt: "杭州斯古特科技有限公司企业铭牌",
    facts: [
      { value: "2024 年", label: "成立时间" },
      { value: "杭州临平", label: "公司位于" },
      { value: "12 人", label: "员工人数" },
      { value: "欧洲 · 北美 · 澳洲", label: "覆盖市场" },
    ],
  },
  overview: {
    title: "公司概况",
    intro:
      "依托杭州临平总部的协同团队，公司以欧美及澳洲自营独立站为核心，结合速卖通、亚马逊等跨境平台渠道，统筹视觉呈现、海外仓储履约、跨境物流与本地售后备件支持，为合作品牌和终端骑行用户提供稳定可靠的出海运营支撑。",
  },
  brands: {
    partnersTitle: "我们的在线商店",
    ownBrandTitle: "我们的品牌",
    visitStore: "访问独立站",
    partners: [
      {
        name: "KuKirin",
        logo: "/images/kukirin-prime.webp",
        logoClass: "logo-mark",
        href: "https://kukirinprime.com",
        domain: "kukirinprime.com",
        description:
          "主打越野与高性能的电动滑板车品牌，以双电机大功率车型著称。在欧洲市场拥有广泛的用户基础，是当地主流的性能车品牌之一。",
      },
      {
        name: "JOYOR",
        logo: "/images/joyorprime.avif",
        logoClass: "logo-wide",
        href: "https://joyorprime.com",
        domain: "joyorprime.com",
        description:
          "专注电动滑板车研发制造的源头品牌，产品主打全地形能力与高性能。是公司自营独立站的核心品牌，覆盖欧洲多个市场。",
      },
      {
        name: "NAVEE",
        logo: "/images/navee.svg",
        logoClass: "logo-wide",
        href: "https://naveescooter.com",
        domain: "naveescooter.com",
        description:
          "追觅科技旗下智能出行品牌，2021 年推出，以城市通勤电动滑板车为主力产品。现已进入欧洲市场前三、覆盖 60 多个国家和地区。",
      },
    ],
    ownBrand: {
      name: "JOFEN",
      logo: "/images/JOFEN.avif",
      href: "https://jofenscooter.com",
      domain: "jofenscooter.com",
      description:
        "公司旗下零售品牌，面向海外市场提供实用可靠的电动滑板车及日常骑行配件。",
    },
  },
  operations: {
    title: "跨境运营",
    summary:
      "公司以自营独立站为核心渠道，覆盖欧洲、北美和澳洲市场，同时布局速卖通、亚马逊等第三方平台，形成独立站为主、平台渠道为辅的跨境销售网络。",
    points: [
      {
        title: "Shopify 模板与专属应用开发",
        detail:
          "可根据业务需求自主开发主题模板、Shopify App 及扩展插件，打破平台原生功能限制。例如实时库存显示、批量折扣、经营看板及商品目录管理，直接服务于前台转化与后台精细化运营。",
      },
      {
        title: "自研多店提效与自动化工具",
        detail:
          "针对多店铺、多语种的日常痛点，自研订单与物流费核算导出工具及批量 AI 翻译工作流，省去繁琐的人工对账与逐条翻译，大幅加快新品出海与多市场铺货节奏。",
      },
    ],
    trophyAlt: "来自 Shopify 官方的成就纪念碑",
    trophyCaption: "来自 Shopify 官方的成就纪念碑",
  },
  facilities: {
    title: "仓库与运营中心",
    photos: [
      { src: "/images/company/scooter-fleet.jpg", caption: "展示与售后样车区" },
      { src: "/images/company/warehouse-racks.jpg", caption: "备货仓储货架区" },
      { src: "/images/company/parts-bench.jpg", caption: "售后配件与服务工位" },
      { src: "/images/company/dispatch-desk.jpg", caption: "质检与订单发货工位" },
    ],
  },
  partnership: {
    title: "合作方式",
    summary:
      "公司寻求与电动滑板车及配件的代理分销合作，依托自营独立站和平台渠道覆盖欧洲、北美和澳洲市场，配套本地仓储物流与售后服务体系，帮助品牌提升销售。",
    models: [
      {
        code: "01",
        title: "品牌代理",
        detail:
          "承接品牌在欧洲、北美及澳洲市场的代理销售与推广，覆盖独立站搭建、本地化视觉呈现与区域市场拓展。",
      },
      {
        code: "02",
        title: "产品分销",
        detail:
          "依托自营垂类独立站与速卖通、亚马逊等主流跨境平台快速铺货，支持多语种商品目录与多店铺库存同步。",
      },
      {
        code: "03",
        title: "全链路承接",
        detail:
          "提供海外仓储履约、跨境物流对接、本地售后维修与备件支持，并配套海外广告投放与内容营销服务。",
      },
    ],
  },
  contact: {
    title: "与我们联系",
    company: "杭州斯古特科技有限公司",
    address: "中国 · 浙江省杭州市临平区",
    phoneLabel: "联系电话",
    emailLabel: "电子邮箱",
    copy: "复制",
    copied: "已复制",
    footerLinksTitle: "相关站点",
    storesTitle: "自营商店",
    copyright: "杭州斯古特科技有限公司",
  },
};

export const translations = {
  en: english,
  zh: chinese,
} satisfies Record<Locale, typeof english>;
