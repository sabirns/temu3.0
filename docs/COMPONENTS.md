# Component Architecture & Department Page System

This document outlines the component architecture, layout building blocks, Gutenberg content hydration, and the complete architecture of the **Department Page System** in [`src/pages/DepartmentSingle.jsx`](file:///home/sabir/projects/mu/src/pages/DepartmentSingle.jsx).

---

## 1. Component Hierarchy & Organization

```
src/
├── components/          # Reusable presentation and interactive UI blocks
├── templates/           # Layout wrappers for dynamic WordPress content models
└── pages/               # Route endpoints and feature views
```

### Layout Components

#### 1. [`Header`](file:///home/sabir/projects/mu/src/components/Header.jsx)
- **Top Bar**: Displays emergency announcements, dynamic ticker notifications (`fetchNotificationsFromAPI`), official contact information, and social media handles.
- **Dynamic MegaMenu**: Injects server-rendered HTML from `/wp-json/mu/v2/mega-menu/primary_ml` or `primary_en`. Normalizes IDs to `#mega-menu-custom`. Attaches event delegation to intercept internal links and toggle mobile submenus.
- **Dropdown Viewport Detection**: Checks `.sub-menu` bounding rects and dynamically appends `.open-upwards` if a dropdown extends beyond viewport bottom.
- **Search Modal**: Fullscreen overlay triggered by the search icon; dispatches client-side navigation to `/:lang/search?q=...`.
- **Language Switcher**: Toggles between Malayalam and English with a 3-tier translation resolution strategy.

#### 2. [`Footer`](file:///home/sabir/projects/mu/src/components/Footer.jsx)
- **Useful Links**: Categorized links to Kerala Government portals, UGC fellowships, and scholarship resources.
- **Dynamic Contact Data**: Reads address, phone, and email dynamically from the WordPress Contact page (`contact-us-ml` / `contact-us`), with hardcoded fallbacks.
- **Interactive Map**: Embedded Google Maps iframe pointing to the Vakkad, Tirur campus.

#### 3. [`FloatingSocial`](file:///home/sabir/projects/mu/src/components/FloatingSocial.jsx)
- Fixed right-side dock providing instant access to Facebook, Instagram, Threads, YouTube, X, and direct phone contact.
- Features hover expansion, bilingual tooltips, and auto-hide on mobile devices.

#### 4. [`GutenbergContent`](file:///home/sabir/projects/mu/src/components/GutenbergContent.jsx)
- Renders sanitized HTML strings output by WordPress classic and Gutenberg block editors.
- **Accordion Hydration**: Intercepts clicks on `.custom-accordion-block .accordion-header`, computing `scrollHeight` for smooth expansion without React state rerenders.
- **Tabs Hydration**: Intercepts clicks on `.custom-tabs-block .tab-nav-btn`, activating target `.tab-panel`.
- **Gallery Lightbox Portal**: Intercepts image clicks within `.gallery`, `.wp-block-gallery`, or `.wp-block-image`, rendering a full-featured modal lightbox via `createPortal(..., document.body)` with keyboard navigation (Esc, Arrow Left, Arrow Right).

#### 5. [`SocialActivitiesGrid`](file:///home/sabir/projects/mu/src/components/SocialActivitiesGrid.jsx)
- Displays community and social outreach activities (`post_type=activity`).
- Detects YouTube video URLs in ACF fields (`item.acf.video`), automatically extracts video IDs, renders YouTube thumbnail fallbacks, and opens an embedded modal video player on click.

---

## 2. Department Page Architecture ([`DepartmentSingle.jsx`](file:///home/sabir/projects/mu/src/pages/DepartmentSingle.jsx))

`DepartmentSingle.jsx` (73KB) is the most comprehensive component in the codebase. It represents a full-featured department micro-portal.

### Structural Layout
```
+-------------------------------------------------------------------------+
|                               HERO BANNER                               |
| Breadcrumb: Home / Departments / [Department Title]                     |
| Large Banner Image (with excerpt caption overlay)                       |
+------------------------------------+------------------------------------+
| SIDEBAR ACCORDION NAVIGATION       | ACTIVE TAB CONTENT PANEL           |
|                                    |                                    |
| [v] About the School               | - Auto-playing Gallery Carousel    |
|   ├── Overview                     | - Title & Overview Rich Text       |
|   ├── School Highlights            | - Expandable Content ("Read more") |
|   ├── Programmes                   | - Data Cards / Grids / Accordions  |
|   ├── Faculty Profile              |                                    |
|   ├── Infrastructure & Facilities  |                                    |
|   ├── Student Projects             |                                    |
|   └── Former Students              |                                    |
| [>] Curriculum                     |                                    |
| [>] Research                       |                                    |
| [>] Department Activities          |                                    |
| [>] Achievements                   |                                    |
| [>] Resources & Contact            |                                    |
+------------------------------------+------------------------------------+
```

### Navigation System & Tabs
The sidebar is structured into 6 accordion groups and 24 selectable tabs:
1. **About the School (`about`)**:
   - `overview`: Overview summary, photo carousel, Gutenberg body.
   - `highlights`: Statistical counters (Programs, Faculty members, Projects).
   - `programs`: Course cards with links to `/:lang/courses/:slug`.
   - `faculty`: Faculty member cards with avatars, designations, expertise, contact, and CV links.
   - `facilities`: Facilities accordion with photos and descriptions.
   - `student_projects`: Student research and academic projects.
   - `former_students`: Alumni list or details.
2. **Curriculum (`curriculum`)**:
   - `curriculum_ba_bsc`: Undergraduate syllabus documents.
   - `curriculum_ma_msc`: Postgraduate syllabus documents.
   - `curriculum_phd`: Doctoral curriculum.
   - `curriculum_po_pso`: Program Outcomes (PO) & Program Specific Outcomes (PSO).
3. **Research (`research`)**:
   - `research_thrust`: Core research thrust areas.
   - `research_publications`: Student publications.
   - `projects`: Funded departmental research projects (investigator, agency, grant funds).
4. **Department Activities (`activities`)**:
   - `activities_seminars`: Seminars, talks, and training programs.
   - `activities_workshops`: Workshops and development programs.
   - `activities_best_practices`: Departmental best practices.
   - `activities_extension`: Social and community extension activities.
   - `activities_field_visits`: Study tours and field visits.
   - `activities_events`: Key departmental events.
   - `activities_mous`: Institutional Memoranda of Understanding (MoUs).
   - `activities_addon_courses`: Add-on and certificate courses.
5. **Achievements (`achievements`)**:
   - `student_achievements`: Student awards and competitive accomplishments.
   - `faculty_achievements`: Faculty awards and honours.
   - `awards_grants`: Grants received.
   - `scholarships`: Student scholarships.
6. **Resources & Contact (`resources_contact`)**:
   - `placement_career`: Placement records and career support services.

---

## 3. Department ACF Field Rendering & Relationships

| Feature Area | ACF Field Name | Data Type & Structure | Rendering & Fallback Logic |
| :--- | :--- | :--- | :--- |
| **Overview** | `acf.overview` | Rich text / HTML string | Falls back to `wpDept.content.rendered`. Truncated to 500px with a "Read more" toggle button. |
| **Gallery** | `acf.gallery` | Array of Gallery post IDs or objects | Extracted into numeric IDs; fetched in parallel via `fetchGallery({ include: galleryIds.join(',') })`. Merged with department taxonomy gallery items. |
| **Projects** | `acf.projects` | Array of objects (`name`, `project_title`, `name_of_the_funding_agency`, `amount_rs`, `duration`, `year_of_award_or_sanction`) | Displayed as a table of project details. Hidden when `acf.hide_projects_tab_in_website` is true. |
| **Facilities** | `acf.facilities` | Array of objects (`facilities_title`, `facilities_description`) | Rendered via `<FacilitiesAccordion />`. Hidden when `acf.hide_facility_tab_in_website` is true. |
| **Outcomes** | `acf.po_and_pso` | Rich text / Gutenberg HTML | Rendered via `<GutenbergContent />`. Hidden when `acf.hide_po_and_so_tab_in_website` is true. |
| **Syllabus** | `acf.syllabus` | Array of objects (`title`, `file`) | Downloadable syllabus table. Hidden when `acf.hide_syllabus_tab_in_website` is true. |
| **Key Research Areas** | `acf.key_research_areas` | Rich text / HTML string | Displayed via `<GutenbergContent />`. Hidden when `acf.hide_key_research_areas_tab_in_website` is true. |
| **Publications**| `acf.students_publications` or `acf.student_publications` | Rich text / HTML string | Displayed using `<GutenbergContent />`. |
| **Seminars** | `acf.seminar_workshops` | Rich text / HTML string | Displayed with department activities (`activity_type=1992`). Hidden when `acf.hide_seminars_tab_in_website` is true. |
| **Best Practices** | `acf.best_practices` | Rich text / HTML string | Rendered via `<GutenbergContent />`. Hidden when `acf.hide_best_practices_tab_in_website` is true. |
| **MoUs** | `acf.mous` | Rich text / HTML string | Rendered via `<GutenbergContent />`. Hidden when `acf.hide_mou_tab_in_website` is true. |
| **Add-on Courses** | `acf.add-on_courses_copy` | Rich text / HTML string | Rendered via `<GutenbergContent />`. Hidden when `acf.hide_addon_tab_in_website` is true. |
| **Student Achievements** | `acf.student_achievement` | Rich text / HTML string | Displayed via `<GutenbergContent />`. Hidden when `acf.hide_students_achievement_tab_in_website` is true. |
| **Faculty Achievements** | `acf.faculty_members_achievement` | Rich text / HTML string | Displayed via `<GutenbergContent />`. Hidden when `acf.hide_faculty_achievement_tab_in_website` is true. |
| **Awards / Grants** | `acf.awards` | Rich text / HTML string | Displayed via `<GutenbergContent />`. Hidden when `acf.hide_awards_tab_in_website` is true. |
| **Scholarships** | `acf.scholarships` | Rich text / HTML string | Displayed via `<GutenbergContent />`. Hidden when `acf.hide_scholarship_tab_in_website` is true. |
| **Placement & Career** | `acf.placement_and_career_support` or `acf.placements` | Rich text / HTML string | Displayed via `<GutenbergContent />`. Hidden when `acf.hide_placement_tab_in_website` is true. |
| **Other Content (All Sections)** | `acf.other_content_in_about_school`, `acf.other_content_research_section`, `acf.other_content_activities_section`, `acf.other_content_achievements_section`, `acf.other_content_contact_section` | Flexible Content / Array of objects (`other_content_tab_title`, `content`) | Dynamically generates dedicated individual tabs under their respective main sections using `other_content_tab_title` as the tab title. |

### Faculty Relationship Handling
Faculty members are **NOT** stored as simple text strings. They are independent WordPress posts (`post_type=faculties`) linked to departments via the `faculty_department` taxonomy:
1. `deptTermIds`: The department's assigned taxonomy term IDs are read from `deptData.faculty_department`.
2. All faculty posts for the language are fetched via `fetchFaculties({ lang })`.
3. Frontend filters faculty where `faculty._embedded['wp:term']` or `faculty.faculty_department` contains any of the department's term IDs.
4. Each faculty card displays:
   - Featured image (or avatar placeholder)
   - `title.rendered` (name)
   - `acf.designation` (e.g. Professor & Head)
   - `acf.email_address` and `acf.phone_number`
   - `acf.description` (Area of expertise)
   - Profile CV link: resolved via `getFacultyProfileUrl(faculty)` checking `acf.profile`, `profilePdf`, or attached PDF media.

### Handling Missing or Empty ACF Fields
- **Non-breaking optional chaining**: All ACF access uses optional chaining: `wpDept?.acf?.projects?.length`.
- **Dual key fallbacks**: Handles legacy variations gracefully: `wpDept?.acf?.students_publications || wpDept?.acf?.student_publications`.
- **Bilingual Empty States**: When an ACF section is completely empty, the component avoids rendering broken layouts and displays a clean bilingual placeholder:
  ```jsx
  {!wpDept?.acf?.po_and_pso && !wpDept?.acf?.syllabus?.length && (
    <div className="empty-state">
      <p>{lang === 'ml' ? 'വിവരങ്ങൾ ലഭ്യമല്ല' : 'Information not available'}</p>
    </div>
  )}
  ```

---

## 4. Templates

### 1. [`WordPressPage.jsx`](file:///home/sabir/projects/mu/src/templates/WordPressPage.jsx)
- Generic page template for hierarchical pages.
- Resolves slugs by walking parent chains if duplicates exist.
- Renders PDF embed viewer if `acf.file` is a PDF media item.
- Renders associated courses if `acf.select_course` is set.
- Renders social activities if `acf.activity_type` or special page IDs match.
- Renders portal cards for empty parent pages.

### 2. [`ContactUs.jsx`](file:///home/sabir/projects/mu/src/templates/ContactUs.jsx)
- Renders structured office contact information from dynamic ACF entries.
- Embeds interactive Google Maps locator.
- Handles Gutenberg accordion blocks.

### 3. [`ChildPagesGrid.jsx`](file:///home/sabir/projects/mu/src/templates/ChildPagesGrid.jsx)
- Renders parent page details and queries `fetchPages({ parent: pageData.id })`.
- Displays child cards in a responsive grid (used for `/our-courses-ml` and `/courses-offered`).
