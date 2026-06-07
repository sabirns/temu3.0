export const WORDPRESS_PAGES = {
  HOME: 1,
  ABOUT: 23,
  VISION_MISSION: 24,
  CHANCELLOR: 25,
  PROGRAMS: 26,
  DEPARTMENTS: 27,
  SYLLABUS: 28,
  ADMISSIONS: 29,
  FEES: 30,
  NAAC: 31,
  IQAC: 32,
  RESEARCH: 33,
  PHD: 34,
  EXAMINATIONS: 35,
  RESULTS: 36,
  LIBRARY: 37,
  ALUMNI: 38,
  CONTACT: 39,
  GALLERY: 40,
  FACILITIES: 41,
  SCHOLARSHIPS: 42,
  PLACEMENT: 43,
  CAMPUS: 44,
}

export const MENU_LINKS = [
  {
    label: 'സർവകലാശാല',
    megaMenu: true,
    children: [
      {
        title: 'സർവകലാശാല',
        links: [
          { label: 'സർവകലാശാലയെക്കുറിച്ച്', pageId: WORDPRESS_PAGES.ABOUT },
          { label: 'ദർശനവും ദൗത്യവും', pageId: WORDPRESS_PAGES.VISION_MISSION },
          { label: 'ചാൻസലറിന്റെ സന്ദേശം', pageId: WORDPRESS_PAGES.CHANCELLOR },
        ]
      },
      {
        title: 'ഭരണം',
        links: [
          { label: 'ചാൻസലർ', pageId: WORDPRESS_PAGES.CHANCELLOR },
          { label: 'വൈസ് ചാന്‍സലര്‍', pageId: WORDPRESS_PAGES.CHANCELLOR },
        ]
      }
    ]
  },
  {
    label: 'അക്കാദമികങ്ങൾ',
    megaMenu: true,
    children: [
      {
        title: 'അക്കാദമികുകൾ',
        links: [
          { label: 'പ്രോഗ്രാമുകൾ', pageId: WORDPRESS_PAGES.PROGRAMS },
          { label: 'ഡിപ്പാർട്ട്മെന്റൽ പ്രവർത്തനങ്ങൾ', pageId: WORDPRESS_PAGES.DEPARTMENTS, isRoute: true, route: '/departments' },
          { label: 'പാഠ്യപദ്ധതി', pageId: WORDPRESS_PAGES.SYLLABUS },
        ]
      },
      {
        title: 'ഗവേഷണം',
        links: [
          { label: 'ഗവേഷണ കൗൺസിൽ', pageId: WORDPRESS_PAGES.RESEARCH },
          { label: 'PhD ഉപാദികൾ', pageId: WORDPRESS_PAGES.PHD },
        ]
      }
    ]
  },
  {
    label: 'പ്രവേശനം',
    dropdown: true,
    links: [
      { label: 'പ്രോഗ്രാമുകളും നിയമങ്ങളും', pageId: WORDPRESS_PAGES.ADMISSIONS },
      { label: 'ഫീസ് ഘടന', pageId: WORDPRESS_PAGES.FEES },
    ]
  },
  {
    label: 'NAAC',
    dropdown: true,
    links: [
      { label: 'Grading', pageId: WORDPRESS_PAGES.NAAC },
      { label: 'NAAC Certificate', pageId: WORDPRESS_PAGES.NAAC },
    ]
  },
  {
    label: 'IQAC',
    dropdown: true,
    links: [
      { label: 'Objectives', pageId: WORDPRESS_PAGES.IQAC },
      { label: 'Members', pageId: WORDPRESS_PAGES.IQAC },
      { label: 'AQAR', pageId: WORDPRESS_PAGES.IQAC },
    ]
  },
  {
    label: 'ഗവേഷണം',
    dropdown: true,
    links: [
      { label: 'ഗവേഷണ കൗൺസിൽ', pageId: WORDPRESS_PAGES.RESEARCH },
      { label: 'PhD ഉപാദികൾ', pageId: WORDPRESS_PAGES.PHD },
    ]
  },
  {
    label: 'പരീക്ഷകൾ',
    dropdown: true,
    links: [
      { label: 'പ്രവണനകൾ', pageId: WORDPRESS_PAGES.EXAMINATIONS },
      { label: 'ഫലങ്ങൾ', pageId: WORDPRESS_PAGES.RESULTS },
    ]
  },
  {
    label: 'ഗ്രന്ഥാലയം',
    dropdown: true,
    links: [
      { label: 'ഇ റിസോഴ്‌സുകൾ', pageId: WORDPRESS_PAGES.LIBRARY },
      { label: 'ഇ-ജേണലുകൾ', pageId: WORDPRESS_PAGES.LIBRARY },
    ]
  },
  {
    label: 'അലുമ്നി',
    dropdown: true,
    links: [
      { label: 'പ്രവൃത്തി', pageId: WORDPRESS_PAGES.ALUMNI },
      { label: 'ആലുമ്നി ഇവന്റുകൾ', pageId: WORDPRESS_PAGES.ALUMNI },
    ]
  },
]
