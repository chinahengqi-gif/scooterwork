export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export function localizedPath(locale: Locale, page = "") {
  return locale === "en" ? `/${page}` : `/${locale}/${page}`;
}

const english = {
  langAttr: "en",
  title: "Hangzhou Scooter Technology Co., Ltd. — about.scooter.work",
  description:
    "Hangzhou Scooter Technology Co., Ltd. (Scooter.work), founded in 2024 in Linping, Hangzhou, specializes in cross-border electric scooter operations, product development, warehousing, and after-sales support.",
  nav: {
    ariaLabel: "Primary navigation",
    aboutTag: "Company",
    about: "Overview",
    brands: "Brands",
    operations: "Operations",
    facilities: "Facilities & R&D",
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
      "Founded in 2024 in Linping, Hangzhou, we are a cross-border e-commerce company focused on electric scooters. Our 12-person team covers product development, independent store operations, warehousing, logistics, and after-sales service.",
    primaryCta: "Business Inquiries",
    secondaryCta: "Visit scooter.work",
    signAlt: "Hangzhou Scooter Technology Co., Ltd. company signage",
    facts: [
      { value: "2024", label: "Founded" },
      { value: "Hangzhou", label: "Linping HQ" },
      { value: "12", label: "Team across 4 divisions" },
      { value: "EU · NA · AU", label: "Core markets" },
    ],
  },
  overview: {
    title: "Company Overview",
    photoAlt: "Hangzhou office and operations team with electric scooters",
    photoCaption: "Hangzhou Linping office and team",
    departmentsTitle: "Organization",
    departments: [
      { name: "Operations", detail: "Independent DTC stores and marketplace channels across Europe, North America, and Australia." },
      { name: "Product Development", detail: "Aftermarket electric scooter upgrades, accessories, and JOFEN complete vehicles." },
      { name: "Logistics", detail: "Cross-border freight, overseas warehousing, and order fulfillment." },
      { name: "After-Sales", detail: "Local customer support, spare parts supply, and technical guides." },
    ],
  },
  brands: {
    partnersTitle: "Our Partners",
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
        "Our proprietary brand. Started with electric scooter modification accessories and now launching complete electric scooters focused on practicality and performance.",
    },
  },
  operations: {
    title: "Cross-Border Operations",
    summary:
      "We operate self-run independent stores as our primary channel across Europe, North America, and Australia, alongside AliExpress, Amazon, and other platforms.",
    points: [
      {
        title: "Custom Shopify Extensions",
        detail:
          "In-house development and deployment of Shopify apps, including Germany warehouse stock display, store dashboards, bulk discounts, order export, and catalog tools.",
      },
      {
        title: "Internal Productivity Tools",
        detail:
          "Self-built tools for multi-store order CSV logistics reconciliation (YunExpress, SF International) and batch AI translation for Shopify Translate & Adapt.",
      },
    ],
    trophyAlt: "Official Shopify achievement milestone trophy",
    trophyCaption: "Official Shopify achievement milestone trophy",
  },
  facilities: {
    title: "Warehouse & Workshop",
    photos: [
      { src: "/images/company/scooter-fleet.jpg", caption: "Multi-model test scooter lineup" },
      { src: "/images/company/printer-3d.jpg", caption: "Industrial 3D printer (LEADER 3D)" },
      { src: "/images/company/workshop-rig.jpg", caption: "Prototyping & machining bench" },
      { src: "/images/company/warehouse-racks.jpg", caption: "Component & controller inventory racks" },
      { src: "/images/company/parts-bench.jpg", caption: "Spare parts shelving & assembly table" },
      { src: "/images/company/dispatch-desk.jpg", caption: "Inspection & order dispatch workstation" },
    ],
    rdTitle: "Selected In-House R&D Products",
    rdItems: [
      { name: "Built-In Scooter Alarm", image: "/images/alarm.jpg" },
      { name: "Steering Damper", image: "/images/damper.webp" },
      { name: "Motor & Controller Upgrade Kit", image: "/images/speed-kit.webp" },
      { name: "Electric Scooter Trailer", image: "/images/scooter-trailer.jpg" },
    ],
    rdNote: "Also includes external electric scooter battery packs. For rider products and tutorials:",
  },
  partnership: {
    title: "Partnership Models",
    summary:
      "We seek agency and distribution partnerships for electric scooters and accessories, combining our independent stores, marketplaces, local warehousing, and after-sales service to grow brand sales in Europe, North America, and Australia.",
    models: [
      {
        title: "Brand Agency",
        detail: "Regional agency sales and brand promotion across Europe, North America, and Australia.",
      },
      {
        title: "Product Distribution",
        detail: "Fast rollout through our self-operated independent stores as well as AliExpress, Amazon, and major platforms.",
      },
      {
        title: "End-to-End Operations",
        detail: "One-stop support covering warehousing and logistics, local after-sales service, advertising, and content marketing.",
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
    "杭州斯古特科技有限公司成立于 2024 年，总部位于杭州临平，是一家专注于电动滑板车出海的跨境电商企业，具备产品开发、独立站运营、仓储物流与售后服务的完整出海链路。",
  nav: {
    ariaLabel: "主导航",
    aboutTag: "公司介绍",
    about: "公司简介",
    brands: "合作伙伴",
    operations: "跨境运营",
    facilities: "仓库与研发",
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
      "杭州斯古特科技有限公司成立于 2024 年，总部位于杭州临平。公司团队 12 人，设有运营部、售后部、物流部和产品开发部，形成了从产品开发、独立站运营到仓储物流与售后服务的完整出海链路。",
    primaryCta: "联系合作",
    secondaryCta: "访问 scooter.work",
    signAlt: "杭州斯古特科技有限公司企业铭牌",
    facts: [
      { value: "2024 年", label: "成立时间" },
      { value: "杭州临平", label: "公司总部" },
      { value: "12 人", label: "运营 · 售后 · 物流 · 研发" },
      { value: "欧洲 · 北美 · 澳洲", label: "覆盖市场" },
    ],
  },
  overview: {
    title: "公司概况",
    photoAlt: "杭州斯古特科技有限公司办公区与电动滑板车",
    photoCaption: "杭州临平办公区实景",
    departmentsTitle: "组织架构",
    departments: [
      { name: "运营部", detail: "负责欧洲、北美、澳洲自营独立站及平台渠道运营。" },
      { name: "产品开发部", detail: "负责电动滑板车改装配件及自有品牌整车研发。" },
      { name: "物流部", detail: "负责跨境物流、海外仓储及订单履约。" },
      { name: "售后部", detail: "负责海外本地售后服务、备件支持与使用指导。" },
    ],
  },
  brands: {
    partnersTitle: "我们的合作伙伴",
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
        "公司自有品牌，起步于电动滑板车改装配件。现正推出电动滑板车整车，主打实用与性能。",
    },
  },
  operations: {
    title: "跨境运营",
    summary:
      "公司以自营独立站为核心渠道，覆盖欧洲、北美和澳洲市场，同时布局速卖通、亚马逊等第三方平台，形成独立站为主、平台渠道为辅的跨境销售网络。",
    points: [
      {
        title: "Shopify 扩展程序自研",
        detail:
          "具备自主开发与部署 Shopify 扩展程序的能力，支持德国仓库存显示、店铺看板、批量折扣、订单导出及产品目录管理。",
      },
      {
        title: "团队效率工具",
        detail:
          "自主开发多商店订单与物流费导出工具（支持云途、顺丰国际）及 Shopify 批量 AI 翻译工具，提升日常运营效率。",
      },
    ],
    trophyAlt: "来自 Shopify 官方的成就纪念碑",
    trophyCaption: "来自 Shopify 官方的成就纪念碑",
  },
  facilities: {
    title: "仓库与工作室",
    photos: [
      { src: "/images/company/scooter-fleet.jpg", caption: "多型号实车测试车队" },
      { src: "/images/company/printer-3d.jpg", caption: "LEADER 3D 打印设备" },
      { src: "/images/company/workshop-rig.jpg", caption: "结构打样与加工工位" },
      { src: "/images/company/warehouse-racks.jpg", caption: "配件仓储货架" },
      { src: "/images/company/parts-bench.jpg", caption: "零配件货架与装配台" },
      { src: "/images/company/dispatch-desk.jpg", caption: "质检与发货工位" },
    ],
    rdTitle: "我们研发的部分产品",
    rdItems: [
      { name: "电动滑板车内置报警器", image: "/images/alarm.jpg" },
      { name: "电动滑板车阻尼器", image: "/images/damper.webp" },
      { name: "电机与控制器升级套件", image: "/images/speed-kit.webp" },
      { name: "电动滑板车拖车", image: "/images/scooter-trailer.jpg" },
    ],
    rdNote: "另含电动滑板车外置电池等配件。产品详情与安装教程请访问：",
  },
  partnership: {
    title: "合作方式",
    summary:
      "公司寻求与电动滑板车及配件的代理分销合作，依托自营独立站和平台渠道覆盖欧洲、北美和澳洲市场，配套本地仓储物流与售后服务体系，帮助品牌提升销售。",
    models: [
      {
        title: "品牌代理",
        detail: "承接品牌在欧洲、北美、澳洲市场的代理销售与推广。",
      },
      {
        title: "产品分销",
        detail: "依托自营独立站及速卖通、亚马逊等平台渠道快速铺货。",
      },
      {
        title: "全链路承接",
        detail: "仓储物流、本地售后、广告投放与内容营销一站式支持。",
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
