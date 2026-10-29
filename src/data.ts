export type Service = {
  slug: string;
  group: string;
  title: string;
  kicker: string;
  headline?: string;
  summary: string;
  image: string;
  imageAlt: string;
  imageFit?: "cover" | "contain";
  posters?: { src: string; alt: string }[];
  paragraphs: string[];
  points?: string[];
  groups?: { heading: string; items: string[] }[];
  sections?: { heading: string; paragraphs: string[] }[];
};

export const company = {
  name: "New Concept Security",
  legal: "New Concept Security Ltd",
  number: "10664067",
  founded: "2017",
  phone: "01253 982211",
  phoneHref: "tel:01253982211",
  mobile: "07496 320245",
  mobileHref: "tel:07496320245",
  email: "mattbaron@newconceptsecurity.co.uk",
  address: ["Concept House", "283 Church Street", "Blackpool", "FY1 3PG"],
  region: "Blackpool, Preston and the North West",
  coverage: "National coverage",
  hoursOffice: "Monday to Friday, 08:00–17:00",
  hoursControl: "Control room, 24 hours, 365 days a year",
  facebook: "https://www.facebook.com/NCSNW",
  acs: "https://www.services.sia.homeoffice.gov.uk/Pages/acs-roac.aspx?contractor=NECOSESC01",
  acsCode: "NECOSESC01",
  careers: "https://www.c247.eu/apply/application_form.aspx?id=100&pr=4",
  staffLogin: "https://www.staff2shift.com/plus/index.aspx?Cookies=1",
  maps: "https://www.google.com/maps/search/?api=1&query=Concept+House+283+Church+Street+Blackpool+FY1+3PG",
};

export const clients = [
  { name: "Preston City Council", src: "/images/clients/preston-council.png" },
  { name: "Cuadrilla Resources", src: "/images/clients/cuadrilla.jpg" },
  { name: "Blackpool Council", src: "/images/clients/blackpool-council.png" },
  { name: "Balfour Beatty", src: "/images/clients/balfour.png" },
  { name: "Blackpool and The Fylde College", src: "/images/clients/bfc.jpg" },
  {
    name: "Blackpool Transport",
    src: "/images/clients/blackpool-transport.png",
  },
  { name: "NHS England", src: "/images/clients/nhs.png" },
  { name: "Vivienne Westwood", src: "/images/clients/viv.png" },
  { name: "Wigan Council", src: "/images/clients/wigan-council.png" },
  { name: "First Leisure", src: "/images/clients/first-leisure.png" },
  { name: "Stonegate Pub Company", src: "/images/clients/stonegate.png" },
  { name: "Rekom UK", src: "/images/clients/rekom.png" },
];

export const services: Service[] = [
  {
    slug: "security-personnel",
    group: "Manned guarding",
    title: "Security Personnel",
    headline: "Security staff to suit your needs.",
    kicker: "Manned guarding",
    summary:
      "Bespoke security teams for premises and people, so assets are protected and you can relax.",
    image: "/images/art/security-personnel.svg",
    imageAlt: "Two suited security officers standing in a building reception",
    paragraphs: [
      "One of the main preventive measures to securing a premise or personnel is manned guarding, which is why it is key that you choose the right provider. At New Concept Security we can offer a variety of bespoke security solutions to ensure that you can relax knowing your assets are being protected.",
      "We are committed to tailoring the right security team to complement your venue, and tailoring the uniform that gets the correct image for your brand.",
      "New Concept Security is an established business in the North West, Lancashire and beyond. Customer service is a priority for every client, and our clients also trust us to run fully compliant systems.",
    ],
    points: [
      "Mobile patrols",
      "Retail security",
      "Event marshals",
      "Construction sites",
      "Uniform tailored to your brand",
      "Fully compliant systems",
    ],
  },
  {
    slug: "guarding",
    group: "Manned guarding",
    title: "Guarding",
    headline: "One of the most proven ways to keep premises safe.",
    kicker: "Manned guarding",
    summary:
      "SIA-licensed officers for gatehouse, corporate access, patrols, CCTV monitoring and concierge duties.",
    image: "/images/art/guarding.svg",
    imageAlt: "Security officer with a clipboard at a gatehouse barrier at dusk",
    paragraphs: [
      "With years of industry experience, New Concept is proud to be a proactive and reliable supplier of security guard services around the UK.",
      "We work thoroughly with companies and individuals in a varied range of industries to ensure the protection of their property, possessions and people. When you hire security officers with us, you can expect expert customer service and a security solution made around your own needs.",
      "Our SIA-licensed security guards and officers are trained to the very best standards and offer a comprehensive portfolio of services. From crowd control and mobile patrols to CCTV monitoring and concierge duties, we have you covered.",
      "Security guarding is still one of the most proven measures to ensure the safety of your premises and personnel.",
      "Whether you need dedicated gatehouse security for an industrial facility or professionals to control access to a corporate office, our guards will take care of your concerns. Their dual-role capabilities, including performing risk assessments and health and safety checks, mean we can tailor our security solutions to a whole range of needs.",
      "Providing more than a straightforward security presence and frequent patrol, New Concept security officers take an active and specialised approach, so you get the results you expect.",
      "Provided on both a permanent and temporary basis, manned guarding is a static guard or security officer providing the visual presence that your premises may require.",
      "Our dedicated and multi-skilled national management team are experienced in providing highly trained, fully vetted and appropriately experienced security staff to public and private sector clients.",
    ],
  },
  {
    slug: "static-guards",
    group: "Manned guarding",
    title: "Static Guards",
    headline: "A constant, recognisable presence.",
    kicker: "Manned guarding",
    summary:
      "On-site officers for construction, car parks, commercial buildings, retail and corporate premises.",
    image: "/images/art/site-officer.svg",
    imageAlt:
      "New Concept Security officer in a high-visibility vest on a construction site",
    paragraphs: [
      "New Concept Security provides static guards for a number of businesses, including construction sites, car parks, commercial buildings and retail premises throughout the North West. We also provide corporate security packages.",
      "A static officer gives a premises a constant, recognisable presence. The post is set around the site, the hours and the image you want your customers and staff to see.",
    ],
  },
  {
    slug: "mobile-security",
    group: "Manned guarding",
    title: "Mobile Security",
    headline: "The ultimate low-cost security service.",
    kicker: "Patrols",
    summary:
      "Nationwide mobile patrols in liveried vans — a practical, lower-cost security presence.",
    image: "/images/art/mobile-patrols.svg",
    imageAlt:
      "Patrol officer checking a locked gate beside a New Concept Security van at night",
    posters: [
      {
        src: "/images/art/mobile-unit-poster.svg",
        alt: "New Concept Security mobile security unit",
      },
    ],
    paragraphs: [
      "Security patrols are the ultimate low-cost security service. At New Concept Security, our guards are experienced, licensed and instantly recognisable in their distinctive uniforms.",
      "Mobile patrols are also used alongside static guarding, event arenas and healthcare premises, visiting sites on an agreed pattern and providing a visible deterrent when a full-time officer is not required.",
      "The patrols run nationwide. Officers attend in signed mobile security vans, and the unit can be reached on 01253 982211.",
    ],
  },
  {
    slug: "retail-guarding",
    group: "Manned guarding",
    title: "Retail Guarding",
    headline: "Trained in every facet of loss prevention.",
    kicker: "Loss prevention",
    summary:
      "Uniformed officers trained in loss prevention, organised retail crime and merchant detention law.",
    image: "/images/art/retail-guarding.svg",
    imageAlt: "Security officer in a suit at the entrance of a retail store",
    paragraphs: [
      "New Concept Security’s uniformed officers are carefully trained in every facet of retail loss prevention, including recognising shoplifters and the tools they use, merchant detention laws, and organised retail crime.",
      "The team is briefed to the store, so the presence protects stock and staff without getting in the way of the customer experience.",
    ],
  },
  {
    slug: "site-security",
    group: "Manned guarding",
    title: "Site Security",
    headline: "Do you need a site security service?",
    kicker: "Construction & premises",
    summary:
      "Surveys, on-site CCTV and perimeter patrols to deter theft and damage on construction sites.",
    image: "/images/art/site-security.svg",
    imageAlt: "Construction site keep out and CCTV signs on perimeter fencing",
    paragraphs: [
      "With a constant need for security, every site is different and with it comes its own set of blind spots, weak areas and security problems. Whether you need us to provide on-site CCTV to complement your existing security team, or regular perimeter fence patrols and an established presence to deter unwanted visitors, we offer a full site survey to highlight the areas that need more security and create a tailored package.",
      "Our team can help prevent theft or damage on your premises. With every construction site comes a risk of damage or theft, whether during the night, the day or at weekends. We understand that every site is different and has its own weak areas, blind spots and security problems.",
      "Whether it is CCTV you need or a regular perimeter fence patrol team, we can provide this for you. A full site survey highlights the areas in need of more security and allows us to create the package that tends to all of your needs.",
      "In the first instance, for full details on our services and to speak to one of our managers, please call 07496 320245.",
    ],
    points: [
      "Full site survey before the package is set",
      "On-site CCTV to complement an existing team",
      "Perimeter fence patrols and a visible presence",
      "Cover through the day, night and weekends",
    ],
    posters: [
      {
        src: "/images/art/construction-poster.svg",
        alt: "Construction security: how to secure your site",
      },
    ],
  },
  {
    slug: "door-supervision",
    group: "Venues & events",
    title: "Door Supervision",
    headline: "Part of the experience you deliver.",
    kicker: "Venues",
    summary:
      "Discreet door teams for venues and private functions, with a dedicated account manager.",
    image: "/images/art/door-supervision.svg",
    imageAlt: "Two door supervisors outside a venue entrance at night",
    paragraphs: [
      "New Concept Security officers and door supervisors are well known for being able to manage events discreetly. Our door staff are present in the entertainment industry and, increasingly, at private functions.",
      "We know how hard our clients work to deliver the ultimate experience and we want to be part of that picture. With a vast experience of looking after some of the biggest brands in the UK, we know we can add value to your customers’ journey.",
      "We are committed to tailoring the right security team to complement your venue, and tailoring the uniform that gets the correct image for your brand.",
      "You will have a dedicated account manager. We prioritise building relationships at all levels, whether we are supplying you in one town or city, or offering a full national service.",
      "While customer service is a priority for every customer, our clients also trust us to ensure that licensing and local authorities are highly satisfied with our compliance systems and communication. Risk assessments and site induction training are tailored to your venue.",
    ],
  },
  {
    slug: "event-security",
    group: "Venues & events",
    title: "Event Security",
    headline: "Fully bespoke. Complete peace of mind.",
    kicker: "Events",
    summary:
      "SIA-licensed officers for weddings, festivals, crowd control, ticket management and risk assessments.",
    image: "/images/art/event-security.svg",
    imageAlt: "Stewards in high-visibility vests facing a crowd at a night event",
    paragraphs: [
      "With a vastly experienced management team and a qualified, suitably licensed workforce, New Concept Security delivers fully bespoke event security — and complete peace of mind.",
      "We provide comprehensive security services for events of all sizes. Whether you require security officers to guard the entrance to your wedding venue, mobile patrols to monitor a large festival arena, or security guards to carry out crowd control, ticket management or risk assessments, we have you covered.",
      "Each of our security officers is SIA licensed and trained to the highest standards.",
    ],
  },
  {
    slug: "personal-security",
    group: "Venues & events",
    title: "Personal Security",
    headline: "Close protection, wherever you go.",
    kicker: "Close protection",
    summary:
      "Close protection and static officers for executives, public figures, events and commercial sites.",
    image: "/images/art/close-protection.svg",
    imageAlt: "Close protection officer in a dark overcoat beside a car",
    paragraphs: [
      "New Concept Security close protection personnel provide a high level of security, using proactive operational procedures and on-the-ground support to instigate and maintain appropriate levels of protection. Our bodyguard staff includes highly skilled personnel, experienced in personal protection both domestically and internationally. We can provide you, your executives or key clients with a well-planned bodyguard protection scheme for local or international travel.",
      "New Concept Security has years of experience providing professional and highly trained static guards and security services.",
      "Be it a public figure, entertainer or group, we can evaluate the individual security requirements of an itinerary and its locations, and we will carry out a detailed threat assessment. We are known for a realistic approach and dynamic delivery. Bodyguard services are available to the full range of client groups, each with differing needs, requirements and circumstances. The service is tailored, and available 24 hours a day, 7 days a week.",
      "In the first instance, to speak to one of our managers, please call 07496 320245.",
    ],
    points: [
      "Special and sporting events",
      "Bank and corporate security",
      "Crowd control",
      "VIP and celebrity bodyguard protection",
      "Commercial premises and high-rise complexes",
      "Gatehouse duties and retail security",
      "Concierge and reception duties",
      "Control room duties",
      "Warehouse security",
      "Railway patrols",
      "School ground security",
    ],
  },
  {
    slug: "healthcare",
    group: "Healthcare",
    title: "Health Care Services",
    headline: "Healthcare and NHS security, round the clock.",
    kicker: "NHS & private care",
    summary:
      "Hospital security, patient watch and portering for the NHS, care homes and private healthcare.",
    image: "/images/art/healthcare.svg",
    imageAlt: "Security officer and a nurse at a hospital emergency entrance",
    paragraphs: [
      "NCS provides expert healthcare security services nationwide. We operate round the clock, 365 days a year, to support NHS and private hospitals, health centres, GP surgeries, dental practices, care homes and walk-in centres. Our range includes static and mobile hospital security guards, key holding, and opening and locking of buildings. We have particular expertise in hospital security for violent patient schemes, where the emphasis is on protecting staff and members of the public.",
      "The NHS, private hospitals, care homes and healthcare sectors have particular security requirements. NCS offers a full range of site protection services designed to safeguard doctors’ surgeries, health premises, residential care homes, hospitals and surgeries. We can secure your staff, patients and visitors, and help keep hospital or healthcare premises safe.",
      "We can offer a range of 24-hour security services designed to protect NHS, hospital and healthcare premises and assets.",
    ],
    groups: [
      {
        heading: "What the service covers",
        items: [
          "Static guards and night watch for A&E and casualty departments, and surgeries",
          "A visible on-site presence to deter assaults and anti-social behaviour",
          "Support and safeguarding of staff and patients",
          "Mobile security guards visiting healthcare premises and protecting assets",
          "Security and management of controlled areas, medicines and specialist medical equipment",
          "Theft and loss protection from hospitals and surgeries",
          "Full security management of NHS healthcare and private sector hospitals",
          "Services to deter theft and vandalism from NHS and health premises",
          "Alarm, CCTV and security systems for hospitals, NHS premises, care homes and medical premises",
        ],
      },
      {
        heading: "Premises we tailor for",
        items: [
          "Large-scale NHS hospitals",
          "Cottage hospitals and specialist treatment centres",
          "Private sector hospitals and treatment centres",
          "Walk-in centres and emergency medical centres",
          "Elderly and residential care homes",
          "Doctor surgeries and practices",
          "Dental surgeries",
          "Support for hospital administrators, care managers and facilities managers",
        ],
      },
    ],
    sections: [
      {
        heading: "Patient watch",
        paragraphs: [
          "Each member of our patient watch team has years of experience in mental health as well as professional security. They treat patients with dignity and respect, and stay conscious of particular requirements.",
          "Our crew is there to support your medical team in an emergency and to assist them in any way they can. Patient watch is not limited to a hospital ward. Our security personnel can also assist paramedics and ambulance staff with transporting a violent patient to or from hospital.",
          "All our patient watch staff are fully licensed by the Security Industry Authority. They have received restraint training for instances where a patient poses a physical threat to themselves or others. Each member of the team has an enhanced DBS check and can be relied upon to act with due care and discretion.",
        ],
      },
      {
        heading: "Portering",
        paragraphs: [
          "Porters are one of the often unrecognised teams that keep a hospital running. They are as fundamental to a patient’s care as fleet drivers are to a retail supply chain.",
          "For NHS staff, waiting lists and the risk of burnout have heightened the demand for agency staff to backfill posts. NCS provides hospital portering services to several NHS hospitals throughout the UK.",
          "With a focus on a professional, efficient and dynamic service, our porters support smooth transport to departments and wards site-wide. Porters are one of the only non-clinical teams whose patient care can directly affect a patient’s experience, and a better patient experience is linked to better health outcomes.",
        ],
      },
    ],
  },
  {
    slug: "key-holding",
    group: "Response",
    title: "Key Holding",
    headline: "Professional peace of mind.",
    kicker: "Alarm response",
    summary:
      "Secure off-site key holding, alarm response, lock and unlock, and vacant property inspections.",
    image: "/images/art/key-holding.svg",
    imageAlt: "Officer with a torch and keys responding to an alarm at night",
    paragraphs: [
      "New Concept Security specialises in key holding, alarm response and mobile patrol services. We have the expertise to help you reduce risks to your business, protecting your property and assets and providing a safe environment for your staff.",
      "At New Concept Security we specialise in key holding, alarm response, vacant property inspections, and lock and unlock services.",
      "You can have peace of mind when leaving this service to New Concept. Our SIA-licensed guards provide a reliable solution, responding to an alarm activation in one of our signed, liveried vehicles, and will notify the police or the local authority if there are signs of criminal activity.",
      "Our security team stores a complete set of your keys in a secure, off-site premises. If you require immediate access to your property, the team can grant entry whenever you need it — 24 hours a day, 365 days a year.",
      "We understand how important it is that keys are stored securely. Our key holding sites are robustly protected, with a security presence, CCTV and physical security measures in place.",
      "When you leave your property at the end of the day, it is vulnerable to theft and vandalism. With an alarm response service from New Concept, security professionals stand by to investigate alarm activations, whatever the time of day or night.",
      "At NCS, we pride ourselves on our average 60-minute response time, so an SIA-licensed security officer arrives at the scene and intruders can be stopped in their tracks.",
      "Many businesses allocate an internal key holder to lock and unlock at the start and end of the day. That can work, but placing the responsibility on one employee can disrupt the business. With our officers opening and closing for you, employees are not left as the target for someone trying to access the property.",
      "Protect your business from just £3 per week. Call us for a no-obligation quote.",
    ],
    points: [
      "Secure off-site key storage",
      "Alarm response, average 60 minutes",
      "Lock and unlock services",
      "Vacant property inspections",
      "Liveried response vehicles",
      "Available 24 hours, 365 days a year",
    ],
    posters: [
      {
        src: "/images/art/lock-unlock-poster.svg",
        alt: "Lock and unlock service",
      },
    ],
  },
  {
    slug: "lock-and-unlock",
    group: "Response",
    title: "Lock and Unlock",
    headline: "A trusted officer to open and close.",
    kicker: "Opening and closing",
    summary:
      "Officers open and close the premises, so the keys are not left with one member of staff.",
    image: "/images/art/lock-unlock.svg",
    imageAlt:
      "A key in a door lock on a New Concept Security tag, between day and night",
    paragraphs: [
      "Many businesses allocate an internal key holder to lock and unlock at the start and end of the day. That can work, but placing the responsibility on one employee can disrupt the business. With our officers opening and closing for you, employees are not left as the target for someone trying to access the property.",
      "New Concept Security specialises in key holding, alarm response, vacant property inspections, and lock and unlock services. The same SIA-licensed officers attend in signed, liveried vehicles.",
      "The control room is open 24 hours a day, 365 days a year. Call 01253 982211 for more information.",
    ],
    points: [
      "Opening and closing at the start and end of the day",
      "Staff are not left as the person holding the keys",
      "SIA-licensed officers in liveried vehicles",
      "Sits alongside key holding and alarm response",
    ],
  },
  {
    slug: "cctv-and-alarms",
    group: "Response",
    title: "CCTV & Alarms",
    headline: "Reliable, next-day CCTV.",
    kicker: "Systems",
    summary:
      "Next-day CCTV, wireless systems and access control, surveyed and installed by our own team.",
    image: "/images/art/cctv-control-room.svg",
    imageAlt: "Control room operator watching a wall of CCTV monitors",
    paragraphs: [
      "We operate on a next-day service level. We can deliver CCTV to businesses nationwide, and provide a dedicated security manager as the point of contact for the survey, sale, maintenance, installation and support. If a site has a high or immediate vulnerability, we can provide a rapid-response survey.",
    ],
    groups: [
      {
        heading: "What makes the in-house CCTV systems distinct",
        items: [
          "No broadband, telephone line, mains or generator required to run the system",
          "Smoke sensors, door contacts and key fob systems can be fully integrated",
          "A large reduction in out-of-hours generator running costs",
          "Will deploy in areas conventional CCTV will not",
          "Wireless video PIR cameras",
          "Operates in the lowest light levels",
          "Can be used to complement manned guarding",
          "iPhone and smartphone compatibility",
        ],
      },
    ],
    sections: [
      {
        heading: "Access control",
        paragraphs: [
          "New Concept Security provides a complete range of access control systems and reader technology, from a single door to a large multi-user networked solution. Solutions are created with the customer’s budget, requirements and future expansion in mind.",
          "The work starts with a consultation on the security concept that suits the business, followed by the application and future preventative maintenance. Access control can be integrated with alarms, CCTV, intercom and communications. Technology includes proximity readers, electronic locking and swipe cards.",
        ],
      },
      {
        heading: "Installation",
        paragraphs: [
          "A security system only works if it is installed correctly. New Concept Security has installation specialists who are trained and certified, so the system is customised to the site and functions as it should. We explain how it works and answer questions. Contact us for a free, no-obligation consultation and quote.",
          "In the first instance, to speak to one of our managers, please call 07496 320245.",
        ],
      },
    ],
    posters: [
      {
        src: "/images/art/rapidetect-poster.svg",
        alt: "RapiDetect solar-powered protection tower",
      },
      {
        src: "/images/art/standalone-poster.svg",
        alt: "Stand alone camera unit for a site without existing infrastructure",
      },
    ],
  },
  {
    slug: "standalone-cameras",
    group: "Response",
    title: "Stand Alone Cameras",
    headline: "Solar-powered protection, anywhere.",
    kicker: "RapiDetect",
    summary:
      "Solar-powered camera units for outdoor sites with no broadband, mains or generator.",
    image: "/images/art/standalone-cameras.svg",
    imageAlt: "A stand-alone solar camera unit on a construction site at night",
    posters: [
      {
        src: "/images/art/rapidetect-poster.svg",
        alt: "RapiDetect solar-powered protection tower",
      },
    ],
    paragraphs: [
      "RapiDetect is the ideal security solution for a variety of outdoor applications in places without existing infrastructure.",
      "The units are monitored around the clock. An activation is followed by rapid dispatch, with remote security and active monitoring.",
      "They deploy where conventional CCTV will not, and they can complement a manned guarding team. Where a site is immediately vulnerable, we can provide a rapid-response survey.",
    ],
    points: [
      "External siren with adjustable sound (wireless)",
      "4 external motion detectors with cameras",
      "4 solar panels and a controller for consistent power",
      "Rapid deployment, 60 metre radius coverage",
      "Rapid dispatch, remote security and active monitoring",
      "Monitored 24 hours",
    ],
  },
  {
    slug: "fire-services",
    group: "Response",
    title: "Fire Services",
    headline: "Waking watch, around the clock.",
    kicker: "Waking watch",
    summary:
      "Waking watch and fire marshal patrols for commercial buildings, with real-time NFC reports.",
    image: "/images/art/fire-services.svg",
    imageAlt: "Fire marshal scanning an NFC checkpoint on a waking watch patrol",
    paragraphs: [
      "Our waking watch service provides a reassuring and rapid response to fire safety issues. We work alongside building owners, landlords and managers to implement a fire safety strategy in commercial properties.",
      "Specialising in fire watch and warden services, NCS can provide a commercial property with a solution that keeps the property and people safe. By incorporating measures for fire prevention, detection and evacuation, we help all areas of a property stay aligned with current fire safety legislation and regulations.",
      "Our fire safety specialists are experienced across private and public spaces, construction sites and more. We have over 20 years’ experience providing fire safety services across the UK. Our services comply with UK HSE legislation and the Regulatory Reform (Fire Safety) Order 2005.",
      "A waking watch is a system whereby trained fire marshals continually patrol the interior and exterior of a building in order to detect a fire, raise the alarm and evacuate. It should be recognised as a responsive solution to fire management requirements: 24-hour surveillance of multiple-occupancy buildings. Trained fire safety officers monitor and patrol, searching for signs of fire and fire hazards. Patrols are conducted at regular intervals throughout a 24-hour period, with real-time reports generated at the time of patrol.",
      "On arrival, NCS fire officers place NFC tag points in key areas for marshals to scan on their patrols. Clients receive real-time feedback and reports, showing that hazard points are routinely patrolled.",
      "In the event of a fire alarm, fire marshals alert the emergency services, locate the cause of the alarm, alert everybody to the emergency and, if required, evacuate the building in accordance with its fire evacuation plan. Marshals are kitted with durable fire safety equipment.",
    ],
  },
];

export const serviceGroups = [
  ...new Set(services.map((service) => service.group)),
];

export const groupIntros: Record<string, string> = {
  "Manned guarding":
    "SIA-licensed officers on static posts, mobile patrols, retail floors and construction sites.",
  "Venues & events":
    "Door teams, event security and close protection, briefed to the venue and the brand.",
  Healthcare:
    "Hospital security, patient watch and portering for the NHS and private care.",
  Response:
    "Key holding, alarm response, CCTV and fire safety, run from the 24-hour control room.",
};

export const stats = [
  { value: "97%", label: "Customer retention rate" },
  { value: "15k", label: "Alarm call-outs responded to last year" },
  { value: "100%", label: "SIA licensed and trained staff" },
  { value: "350", label: "Clients on average" },
];

export const promises = [
  { value: "24/7", label: "Control room, 365 days a year" },
  { value: "60 min", label: "Average alarm response time" },
  { value: "2017", label: "Founded in Blackpool" },
  { value: "ACS", label: "SIA Approved Contractor" },
];

export const approach = [
  {
    title: "Consultation",
    body: "Call the office or send an enquiry. A manager talks through the site, the hours and the risks.",
  },
  {
    title: "Site survey",
    body: "Every site is surveyed first, so blind spots and weak areas shape the package.",
  },
  {
    title: "Bespoke proposal",
    body: "A tailored solution. If a smaller service will do the job, that is the one that gets quoted.",
  },
  {
    title: "Deployment",
    body: "SIA-licensed officers on site, backed by the control room 24 hours a day.",
  },
];

export const strengths = [
  "SIA Approved Contractor for guarding, door supervision and key holding",
  "Fully vetted, SIA-licensed officers",
  "A dedicated account manager for every client",
  "Control room at Concept House, 24 hours, 365 days a year",
  "Signed, liveried response vehicles",
  "Able to react and deliver at speed and at scale",
  "An established business in the North West, Lancashire and beyond",
  "Fully compliant systems, trusted by licensing and local authorities",
];

export const featured = [
  "security-personnel",
  "site-security",
  "door-supervision",
  "healthcare",
  "key-holding",
  "cctv-and-alarms",
];

export const roles = [
  {
    title: "Static guarding",
    body: "Gatehouse, reception and site posts for commercial, retail and construction clients.",
  },
  {
    title: "Mobile patrols",
    body: "Nationwide patrols in signed vans, including key holding and alarm response.",
  },
  {
    title: "Door supervision",
    body: "Door teams for venues and private functions across the North West.",
  },
  {
    title: "Event security",
    body: "Stewarding, crowd control and ticket management at events of every size.",
  },
  {
    title: "Healthcare",
    body: "Hospital security and patient watch. Needs an enhanced DBS check and restraint training.",
  },
  {
    title: "Control room",
    body: "Monitoring, dispatch and support from Concept House through the night.",
  },
];

export const mainNav = [
  { slug: "security-personnel", label: "Security Personnel" },
  { slug: "key-holding", label: "Key Holding" },
  { slug: "lock-and-unlock", label: "Lock and Unlock" },
  { slug: "site-security", label: "Site Security" },
  { slug: "personal-security", label: "Personal Security" },
  { slug: "cctv-and-alarms", label: "CCTV and Alarms" },
  { slug: "standalone-cameras", label: "Stand Alone Cameras" },
  { slug: "door-supervision", label: "Door Supervision" },
  { slug: "fire-services", label: "Fire Services" },
  { slug: "guarding", label: "Guarding" },
  { slug: "healthcare", label: "Health Care Services" },
  { slug: "event-security", label: "Event Security" },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

export const faqs = [
  {
    q: "Where are you based?",
    a: "Concept House, 283 Church Street, Blackpool, FY1 3PG. We work across Blackpool, Preston and the North West, and we have a national footprint. Security is provided to hundreds of locations throughout the UK, from businesses to NHS providers and commercial premises.",
  },
  {
    q: "When can I reach you?",
    a: "The control room operates 24 hours a day, 365 days a year. Office hours are Monday to Friday, 08:00 to 17:00. Call 01253 982211, or 07496 320245 to speak to a manager about a service.",
  },
  {
    q: "Are you an approved contractor?",
    a: "Yes. New Concept Security holds SIA Approved Contractor Scheme status for Security Guarding, Door Supervision and Key Holding. Officers are SIA licensed. The ACS contractor reference is NECOSESC01.",
  },
  {
    q: "How fast is alarm response?",
    a: "For key holding and alarm response, we work to an average response time of 60 minutes. Officers attend in liveried vehicles and will notify the police or the local authority if there are signs of criminal activity.",
  },
  {
    q: "Do you survey a site first?",
    a: "Yes. For site security we carry out a full survey so the package matches the blind spots and weak areas of that site. For CCTV we provide a dedicated security manager for the survey, and a rapid-response survey where a site is immediately vulnerable.",
  },
  {
    q: "What do you actually provide?",
    a: "Security personnel, static and mobile guarding, retail guarding, construction site security, door supervision, event security, close protection, healthcare and NHS security including patient watch and portering, key holding, lock and unlock, CCTV and alarms, stand-alone solar camera units, access control, and waking watch fire services.",
  },
  {
    q: "How do I get a quote?",
    a: "Call the head office on 01253 982211 or email mattbaron@newconceptsecurity.co.uk. Key holding is advertised from £3 per week. Site security, CCTV and door supervision are quoted after we understand the venue.",
  },
  {
    q: "Do you lock and unlock premises?",
    a: "Yes. Officers can open and close at the start and end of the day, so the keys are not left with one member of staff. Lock and unlock sits alongside key holding, alarm response and vacant property inspections.",
  },
  {
    q: "What is a stand-alone camera unit?",
    a: "RapiDetect is a solar-powered unit for outdoor sites with no existing infrastructure. Each unit has an external siren, four motion detectors with cameras, four solar panels, and coverage of about 60 metres. The units are monitored 24 hours, with rapid dispatch.",
  },
  {
    q: "How do I apply, or log in as staff?",
    a: "Applications are made through the New Concept Security careers form. Existing staff sign in through the staff portal.",
  },
];
