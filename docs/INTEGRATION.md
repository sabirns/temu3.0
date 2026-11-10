# WordPress Integration Contract & Schema Specification

This document serves as the formal **Integration Contract** between the headless WordPress CMS backend and the React frontend. Any changes to WordPress post types, ACF schemas, taxonomies, or REST endpoints must adhere to these specifications to prevent breaking frontend functionality.

---

## 1. REST API Post Types Contract

All post types must be registered in WordPress with `show_in_rest => true` and `supports => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields']`.

### 1. `pages` (`/wp-json/wp/v2/pages`)
- **Key Fields Consumed**:
  - `id`: Numeric page ID.
  - `slug`: URI slug.
  - `title.rendered`: Page title.
  - `content.rendered`: Raw HTML body (rendered via `GutenbergContent`).
  - `parent`: Numeric parent page ID (used in hierarchical validation).
  - `link`: Canonical URL (used to validate parent-child URL paths).
  - `_embedded['wp:featuredmedia']`: Featured banner image URL.
- **ACF Fields**:
  - `acf.file`: Numeric media ID or URL. If PDF, embeds a full-page PDF viewer.
  - `acf.select_course`: Course category term ID. Automatically queries `/courses?course_category=:id`.
  - `acf.activity_type`: Activity taxonomy ID. Automatically queries `/activity?activity_type=:id` and displays `<SocialActivitiesGrid />`.
  - `acf.buttons`: Array of objects (`title`, `description`, `icon`, `external_link` / `link`).
  - `acf.buttons_2`: Array of objects (`title`, `image`, `url`).

### 2. `departments` (`/wp-json/wp/v2/departments`)
- **Key Fields Consumed**:
  - `id`, `slug`, `title.rendered`, `content.rendered`, `excerpt.rendered`.
  - `faculty_department`: Array of assigned taxonomy term IDs.
  - `_embedded['wp:featuredmedia']`: Hero banner image.
- **ACF Fields**:
  - `acf.overview`: Rich text department overview (falls back to `content.rendered`).
  - `acf.gallery`: Array of gallery IDs or gallery post objects.
  - `acf.projects`: Array of funded research projects:
    - `title` (string)
    - `investigator` (string)
    - `agency` (string)
    - `fund` (string)
    - `duration` (string)
  - `acf.facilities`: Array of facility items:
    - `title` (string)
    - `description` (string)
    - `image` (URL or media object)
  - `acf.po_and_pso`: Rich text / HTML for Program & Program Specific Outcomes.
  - `acf.syllabus`: Array of curriculum items (`title`, `file` / `url`).
  - `acf.key_research_areas`: Rich text department thrust/key research areas.
  - `acf.students_publications` or `acf.student_publications`: Rich text student publications list.
  - `acf.seminar_workshops`: Rich text seminar and workshop history.
  - `acf.best_practices`: Rich text department best practices.
  - `acf.mous`: Rich text MoUs and academic collaborations.
  - `acf.add-on_courses_copy`: Rich text add-on and certificate courses.
  - `acf.student_achievement`: Rich text student achievements.
  - `acf.faculty_members_achievement`: Rich text faculty honors and achievements.
  - `acf.awards`: Rich text awards and recognitions.
  - `acf.scholarships`: Rich text scholarships and financial aid.
  - `acf.placement_and_career_support` / `acf.placements`: Rich text career guidance and placements.
  - `acf.other_content_*`: Flexible content fields (`other_content_in_about_school`, `other_content_research_section`, `other_content_activities_section`, `other_content_achievements_section`, `other_content_contact_section`) generating dynamic individual tabs with custom titles (`other_content_tab_title`) and Gutenberg HTML (`content`).
  - `acf.hide_*_tab_in_website`: Boolean flags (`true`/`false`) controlling visibility of department tabs.

### 3. `faculties` (`/wp-json/wp/v2/faculties`)
- **Key Fields Consumed**:
  - `id`, `slug`, `title.rendered`, `content.rendered`, `excerpt.rendered`.
  - `faculty_department`: Taxonomy term IDs linking faculty to departments.
  - `_embedded['wp:featuredmedia']`: Faculty avatar/photo.
  - `_embedded['wp:attachment']`: Attached CV/profile documents.
- **ACF Fields**:
  - `acf.designation`: Official title (e.g. "Professor & Head").
  - `acf.email_address`: Contact email address.
  - `acf.phone_number`: Contact phone number.
  - `acf.description`: Area of expertise / brief bio.
  - `acf.profile`: External profile URL, PDF attachment, or media object.
  - `acf.articles_in_journals`: Rich text / HTML list of journal articles.
  - `acf.books` or `acf.books_authored`: Rich text / HTML list of authored books.
  - `acf.book_chapters`: Rich text / HTML list of book chapters.
  - `acf.articles_in_periodicals`: Rich text / HTML list of periodical articles.
  - `acf.mphil__phd_guided__adjudicated`: Rich text / HTML guidance records.
  - `acf.research_projects`: Rich text / HTML research projects.
  - `acf.workshops__fdp__training_programs`: Rich text / HTML development programs.
  - `acf.awards__achievements__others`: Rich text / HTML honors and awards.

### 4. `activity` (`/wp-json/wp/v2/activity`)
- **Key Fields Consumed**:
  - `id`, `slug`, `title.rendered`, `content.rendered`, `excerpt.rendered`.
  - `faculty_department`: Department taxonomy IDs.
  - `activity_type`: Activity classification term IDs.
  - `_embedded['wp:featuredmedia']`: Activity thumbnail.
- **ACF Fields**:
  - `acf.video`: YouTube video URL.
  - `acf.date`: Activity event date.

### 5. `courses` (`/wp-json/wp/v2/courses`)
- **Key Fields Consumed**:
  - `id`, `slug`, `title.rendered`, `content.rendered`, `excerpt.rendered`.
  - `course_category`: Category term IDs.
  - `faculty_department`: Department term IDs.
  - `_embedded['wp:featuredmedia']`: Course hero image.

### 6. `galleries` (`/wp-json/wp/v2/galleries`)
- **Key Fields Consumed**:
  - `id`, `slug`, `title.rendered`, `content.rendered`, `excerpt.rendered`.
  - `gallery_category`: Taxonomy category IDs (`43` / `160` for Images, `44` / `162` for Videos).
- **ACF Fields**:
  - `acf.photo_gallery.gallery_images` or `acf.gallery`: Array of photo objects containing `full_image_url`, `thumbnail_image_url`, `sizes`, or `url`.
  - `acf.video`: YouTube video link.

### 7. `notifications` (`/wp-json/wp/v2/notifications`)
- **Key Fields Consumed**:
  - `id`, `slug`, `title.rendered`, `content.rendered`, `date`.
  - `notification_category`: Taxonomy IDs (`1888` for Malayalam, `1890` for English).

### 8. `naac`, `iqac`, `nss`, `publications`
- Registered with custom taxonomies: `naac_category`, `iqac_category`, `nss_category`, and `publication_category`.
- `publications` ACF fields:
  - `acf.editor`: Book editor or compiler.
  - `acf.price`: Book price string.

### 9. `slider` (`/wp-json/wp/v2/slider`)
- **Key Fields Consumed**:
  - `id`, `title.rendered`, `content.rendered` (used as slide subtitle).
  - `_embedded['wp:featuredmedia']`: High-resolution slide background.
- **ACF Fields**:
  - `acf.slider_buttons`: Array of objects (`text`, `link`, `style`).

---

## 2. Taxonomies Contract

All taxonomies must have `show_in_rest => true`.

| Taxonomy Name | Associated Post Types | Purpose |
| :--- | :--- | :--- |
| **`faculty_department`** | `departments`, `faculties`, `courses`, `activity`, `student`, `galleries` | Central relational taxonomy grouping all assets under academic schools & departments. |
| **`notification_category`**| `notifications` | Categorizes announcements (`1888`: ML, `1890`: EN). |
| **`activity_type`** | `activity` | Activity classification (`1991`: Socially committed activities, `1992`: Seminars). |
| **`course_category`** | `courses` | Academic levels (BA, MA, PhD). |
| **`gallery_category`** | `galleries` | Photo vs video galleries (`43`/`160` vs `44`/`162`). |
| **`naac_category`** | `naac` | NAAC criteria classification. |
| **`iqac_category`** | `iqac` | Internal Quality Assurance Cell criteria. |
| **`nss_category`** | `nss` | National Service Scheme categories. |
| **`publication_category`** | `publications` | University publications classification. |

---

## 3. Polylang Multilingual Contract

1. **Languages**:
   - Malayalam locale: `ml_IN` or `ml`.
   - English locale: `en_US` or `en`.
2. **REST Exposure**:
   - The REST API must expose translation relationships via either:
     - `_links.translations`: Array of `{ href, lang }` objects.
     - `post.translations`: Object mapping `{ en: [post_id], ml: [post_id] }`.
3. **Query Parameter**:
   - All standard REST endpoints must accept `?lang=ml` or `?lang=en` to filter results by language.

---

## 4. Custom Menu Endpoint Contract

The Header component depends on a custom server-side menu endpoint:
```
GET /wp-json/mu/v2/mega-menu/:menu_slug
```
- **Expected Slugs**: `primary_ml` (Malayalam) and `primary_en` (English).
- **Expected Response**:
  ```json
  {
    "html": "<ul id=\"mega-menu-primary_ml\" class=\"mega-menu\">...</ul>"
  }
  ```
- **Fallback**:
  Standard WordPress menu locations are queried at `/wp-json/wp/v2/menu-locations/top_menu_1`.

---

## 5. Catalog of Breaking Backend Changes

Modifying any of the following on the WordPress server will break frontend functionality:

| Backend Change | Frontend Impact | Severity |
| :--- | :--- | :--- |
| **Disabling `show_in_rest`** on any CPT or taxonomy | Endpoint returns 404; page displays "Not found" or empty states. | **Critical** |
| **Renaming `faculty_department` taxonomy** | Breaks department relationships, faculty filters, activities, and courses. | **Critical** |
| **Renaming ACF field keys** (e.g. `overview`, `projects`, `facilities`, `gallery_images`) | Department tabs, faculty CVs, and gallery lightboxes render blank. | **High** |
| **Altering notification category term IDs** (`1888` / `1890`) | Header ticker and announcements fail to load or show wrong language. | **High** |
| **Altering activity type IDs** (`1991` / `1992`) | Socially committed activities grid and department seminar tabs render empty. | **High** |
| **Modifying Polylang REST exposure** | Header language toggle loses page synchronization and falls back to home/dashboard. | **Medium** |
| **Changing `/wp-json/mu/v2/mega-menu/` namespace** | Main navigation fails to load on desktop and mobile. | **Critical** |
| **Deleting or renaming Homepage Slugs** (`home-page-ml` or ID `465`) | Homepage buttons and portal links disappear. | **High** |
