<?php
    include 'header.php';
?>

<style>
    /* Custom Styles for Department Single Page */
    /* Department Layout Grid */
    .dept-layout {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 40px;
    }

    /* Prevent localized grid blowouts from carousels */
    .dept-layout>* {
        min-width: 0;
    }

    @media (max-width: 992px) {
        .dept-layout {
            grid-template-columns: 1fr;
        }

        .dept-hero {
            padding: 60px 0 40px 0;
            margin-bottom: 40px;
        }
    }

    .dept-hero {
        background: linear-gradient(135deg, var(--primary), #c03939);
        color: white;
        padding: 60px 0;
        margin-bottom: 40px;
        position: relative;
        overflow: hidden;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .dept-hero::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: url('images/slider.jpg') center/cover;
        opacity: 0.1;
        mix-blend-mode: overlay;
    }

    .dept-title {
        font-size: 36px;
        font-weight: 800;
        margin-bottom: 10px;
        position: relative;
        z-index: 1;
    }

    .dept-breadcrumb {
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        position: relative;
        z-index: 1;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 10px;
        display: block;
    }

    /* Using .section-head from main stylesheet */

    .program-card {
        background: var(--card);
        border: 1px solid var(--stroke);
        border-radius: var(--radius);
        padding: 24px;
        transition: all 0.3s ease;
        height: 100%;
        box-shadow: var(--shadow2);
        position: relative;
        overflow: hidden;
    }

    .program-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: var(--primary);
        opacity: 0.5;
        transition: opacity 0.3s ease;
    }

    .program-card:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow);
    }

    .program-card:hover::before {
        opacity: 1;
    }

    .program-card h4 {
        color: var(--primary);
        margin-bottom: 10px;
        font-size: 18px;
    }

    .activity-item {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        padding: 12px;
        border-radius: 8px;
        background: var(--bg0);
        border: 1px solid var(--stroke);
        transition: all 0.2s ease;
    }

    .activity-item:hover {
        background: rgba(172, 38, 41, 0.03);
        border-color: rgba(172, 38, 41, 0.2);
    }

    .activity-item:last-child {
        margin-bottom: 0;
    }

    .activity-icon {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), #c03939);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
    }

    .activity-content h5 {
        margin: 0 0 4px 0;
        font-size: 14px;
        line-height: 1.3;
        color: var(--text);
        font-weight: 600;
    }

    .activity-content p {
        margin: 0;
        font-size: 12px;
        color: var(--muted);
    }

    /* Faculty Card */
    .faculty-item {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        padding: 12px;
        border-radius: 8px;
        background: var(--bg0);
        border: 1px solid var(--stroke);
        transition: all 0.2s ease;
    }

    .faculty-item:hover {
        background: rgba(58, 117, 73, 0.03);
        border-color: rgba(58, 117, 73, 0.2);
    }

    .faculty-item:last-child {
        margin-bottom: 0;
    }

    .faculty-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--secondary), #4a8f5e);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 700;
        flex-shrink: 0;
    }

    .faculty-info h5 {
        margin: 0 0 4px 0;
        font-size: 14px;
        line-height: 1.3;
        color: var(--text);
        font-weight: 600;
    }

    .faculty-info p {
        margin: 0;
        font-size: 12px;
        color: var(--muted);
    }

    /* ========================================
           REUSABLE CONTENT BLOCK SYSTEM
           Use these classes across any page
           ======================================== */

    /* Content Block Container */
    .content-block {
        background: var(--card);
        border: 1px solid var(--stroke);
        border-radius: var(--radius);
        padding: 24px;
        margin-bottom: 24px;
        box-shadow: var(--shadow2);
    }

    .content-block h3 {
        margin: 0 0 16px 0;
        color: var(--secondary);
        font-size: 18px;
        font-weight: 700;
        padding-bottom: 12px;
        border-bottom: 2px solid var(--stroke);
    }

    /* Stats Grid */
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 16px;
        margin-bottom: 20px;
    }

    .stat-card {
        background: var(--bg0);
        border: 1px solid var(--stroke);
        border-radius: 8px;
        padding: 16px;
        text-align: center;
        transition: all 0.2s ease;
    }

    .stat-card:hover {
        border-color: var(--primary);
        box-shadow: 0 4px 12px rgba(172, 38, 41, 0.1);
    }

    .stat-number {
        display: block;
        font-size: 28px;
        font-weight: 700;
        color: var(--primary);
        margin-bottom: 4px;
    }

    .stat-label {
        display: block;
        font-size: 12px;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Data Table */
    .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }

    .data-table thead {
        background: var(--bg0);
    }

    .data-table th {
        padding: 12px;
        text-align: left;
        font-size: 13px;
        font-weight: 600;
        color: var(--text);
        border-bottom: 2px solid var(--stroke);
    }

    .data-table td {
        padding: 12px;
        font-size: 14px;
        color: var(--text);
        border-bottom: 1px solid var(--stroke);
    }

    .data-table tbody tr:hover {
        background: rgba(172, 38, 41, 0.02);
    }

    .data-table tbody tr:last-child td {
        border-bottom: none;
    }

    /* Info List */
    .info-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .info-list li {
        padding: 10px 0;
        border-bottom: 1px solid var(--stroke);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .info-list li:last-child {
        border-bottom: none;
    }

    .info-list .label {
        font-weight: 600;
        color: var(--text);
    }

    .info-list .value {
        color: var(--muted);
    }

    /* Photo Grid */
    .photo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 12px;
        margin-bottom: 20px;
    }

    .photo-grid img {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid var(--stroke);
        transition: all 0.2s ease;
    }

    .photo-grid img:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    /* Achievement Badge */
    .badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }

    .badge-success {
        background: rgba(92, 184, 92, 0.1);
        color: var(--success);
    }

    .badge-primary {
        background: rgba(172, 38, 41, 0.1);
        color: var(--primary);
    }

    .badge-info {
        background: rgba(91, 192, 222, 0.1);
        color: var(--info);
    }

    /* Highlight Box */
    .highlight-box {
        background: linear-gradient(135deg, rgba(172, 38, 41, 0.05), rgba(172, 38, 41, 0.02));
        border-left: 4px solid var(--primary);
        padding: 16px;
        border-radius: 4px;
        margin-bottom: 16px;
    }

    .highlight-box p {
        margin: 0;
        color: var(--text);
        line-height: 1.6;
    }

    /* Owl Carousel Custom Nav */
    .owl-theme .owl-nav [class*=owl-] {
        background: var(--bg1) !important;
        color: var(--text) !important;
        border: 1px solid var(--stroke) !important;
        border-radius: 50% !important;
        width: 40px;
        height: 40px;
        line-height: 38px !important;
        font-size: 18px !important;
        padding: 0 !important;
        transition: all 0.2s ease;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        margin: 0 !important;
        box-shadow: var(--shadow2);
    }

    .owl-theme .owl-nav .owl-prev {
        left: -20px;
    }

    .owl-theme .owl-nav .owl-next {
        right: -20px;
    }

    .owl-theme .owl-nav .owl-next,
    .owl-theme .owl-nav .owl-prev {
        font-size: 0 !important;
    }

    .owl-theme .owl-nav .owl-next:after ,
        .owl-theme .owl-nav .owl-prev:after {
            content: "";
            width: 24px;
            height: 24px;
            background: url(images/arrow.png) no-repeat center center;
            background-size: contain;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
    }

    .owl-theme .owl-nav .owl-next:after {
        transform: translate(-50%, -50%) rotate(180deg);
    }

    .owl-theme .owl-nav [class*=owl-]:hover {
        background: var(--primary) !important;
        color: white !important;
        border-color: var(--primary) !important;
    }

    /* Media Items */
    .media-item {
        display: block;
        position: relative;
        border-radius: var(--radius);
        overflow: hidden;
        background: #000;
    }

    .media-item img {
        width: 100%;
        height: 250px;
        object-fit: cover;
        opacity: 0.9;
        transition: transform 0.5s ease, opacity 0.3s ease;
    }

    .media-item:hover img {
        opacity: 0.7;
        transform: scale(1.05);
    }

    .play-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 50px;
        height: 50px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: var(--primary);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        pointer-events: none;
        transition: transform 0.3s ease;
    }

    .media-item:hover .play-icon {
        transform: translate(-50%, -50%) scale(1.1);
        background: #fff;
    }

    .media-caption {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
        color: white;
        padding: 30px 15px 15px;
        font-size: 14px;
        font-weight: 500;
        pointer-events: none;
    }
</style>
<!-- Dept Hero -->
<div class="dept-hero">
    <div class="container">
        <span class="dept-breadcrumb">Academics &nbsp;/&nbsp; Schools &nbsp;/&nbsp; School of Linguistics &
            Literature</span>
        <h1 class="dept-title">Department of Linguistics</h1>
        <p style="font-size: 18px; max-width: 700px; opacity: 0.9;">Leading the study of language structure,
            history, and usage in Malayalam and beyond.</p>
    </div>
</div>

<!-- Content -->
<main class="page-content" style="padding-bottom: 80px;">
    <div class="container">
        <div class="dept-layout">

            <!-- Main Column -->
            <div class="dept-main">
                <!-- Overview -->
                <section id="overview" style="margin-bottom: 50px;">
                    <div class="section-head">
                        <h2>Overview</h2>
                    </div>
                    <div style="line-height: 1.7; color: var(--text);">
                        <p style="margin-bottom: 20px;">The Department of Linguistics at Malayalam University is
                            dedicated to the scientific study of language, with a special focus on Malayalam and
                            Dravidian languages. Our curriculum bridges theoretical linguistics with practical
                            applications in computational linguistics, language documentation, and translation.</p>
                        <p>Established in 2013, the department aims to foster advanced research and produce scholars
                            capable of addressing contemporary linguistic challenges. We offer a vibrant academic
                            environment with regular seminars, workshops, and international conferences.</p>
                    </div>
                </section>

                <!-- Programs -->
                <section id="programs" style="margin-bottom: 50px;">
                    <div class="section-head">
                        <h2>Academic Programs</h2>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 25px;">
                        <div class="program-card">
                            <h4>MA Linguistics</h4>
                            <p
                                style="font-size: 14px; color: var(--muted); margin-bottom: 12px; display: inline-block; background: var(--bg0); padding: 4px 8px; border-radius: 4px;">
                                2 Years Full-time</p>
                            <p style="font-size: 15px;">Comprehensive study of phonetics, syntax, semantics, and
                                sociolinguistics. Includes fieldwork and dissertation.</p>
                            <a href="#" class="btn btn-small" style="margin-top: 15px;">View Syllabus</a>
                        </div>
                        <div class="program-card">
                            <h4>PhD in Linguistics</h4>
                            <p
                                style="font-size: 14px; color: var(--muted); margin-bottom: 12px; display: inline-block; background: var(--bg0); padding: 4px 8px; border-radius: 4px;">
                                Research Program</p>
                            <p style="font-size: 15px;">Advanced research opportunities in Dravidian linguistics,
                                language technology, and experimental phonetics.</p>
                            <a href="#" class="btn btn-small" style="margin-top: 15px;">Admission Guidelines</a>
                        </div>
                    </div>
                </section>

                <!-- Students Corner -->
                <section id="students" style="margin-bottom: 50px;">
                    <div class="section-head">
                        <h2>Students Corner</h2>
                    </div>

                    <!-- Student Strength Stats -->
                    <div class="content-block">
                        <h3>Student Strength (2023-24)</h3>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <span class="stat-number">45</span>
                                <span class="stat-label">MA Students</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-number">28</span>
                                <span class="stat-label">PhD Scholars</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-number">12</span>
                                <span class="stat-label">Research Fellows</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-number">85</span>
                                <span class="stat-label">Total Students</span>
                            </div>
                        </div>
                    </div>

                    <!-- Placement Details -->
                    <div class="content-block">
                        <h3>Recent Placements & Achievements</h3>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Program</th>
                                    <th>Placement/Achievement</th>
                                    <th>Year</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Anjali Krishnan</td>
                                    <td>MA Linguistics</td>
                                    <td>Research Assistant, CIIL Mysore</td>
                                    <td>2024</td>
                                </tr>
                                <tr>
                                    <td>Rahul Menon</td>
                                    <td>PhD</td>
                                    <td>Assistant Professor, Calicut University</td>
                                    <td>2024</td>
                                </tr>
                                <tr>
                                    <td>Priya Nair</td>
                                    <td>MA Linguistics</td>
                                    <td>Language Consultant, Google India</td>
                                    <td>2023</td>
                                </tr>
                                <tr>
                                    <td>Arun Kumar</td>
                                    <td>PhD</td>
                                    <td>Best Paper Award - ICOLSI Conference</td>
                                    <td>2023</td>
                                </tr>
                                <tr>
                                    <td>Deepa Thomas</td>
                                    <td>MA Linguistics</td>
                                    <td>Junior Research Fellow (UGC-NET)</td>
                                    <td>2024</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Student Activities -->
                    <div class="content-block">
                        <h3>Student Activities & Initiatives</h3>

                        <div class="highlight-box">
                            <p><strong>🎯 Language Documentation Project:</strong> Students are actively involved in
                                documenting endangered dialects of Malayalam in collaboration with local communities
                                across Kerala.</p>
                        </div>

                        <ul class="info-list">
                            <li>
                                <span class="label">Student Research Forum</span>
                                <span class="value">Monthly presentations & discussions</span>
                            </li>
                            <li>
                                <span class="label">Linguistics Club</span>
                                <span class="value">Weekly language games & workshops</span>
                            </li>
                            <li>
                                <span class="label">Field Work Program</span>
                                <span class="value">Annual rural language surveys</span>
                            </li>
                            <li>
                                <span class="label">Publication Support</span>
                                <span class="value">Department journal for student papers</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Student Gallery -->
                    <!-- <div class="content-block">
                        <h3>Student Life Gallery</h3>
                        <div class="photo-grid">
                            <img src="images/slider.jpg" alt="Field work session">
                            <img src="images/gallery1.jpg" alt="Seminar presentation">
                            <img src="images/slider.jpg" alt="Cultural event">
                            <img src="images/gallery2.jpg" alt="Workshop">
                            <img src="images/gallery3.jpg" alt="Group discussion">
                            <img src="images/slider2.jpg" alt="Library session">
                        </div>
                        <p style="font-size: 14px; color: var(--muted); margin: 0;">
                            Students engaged in field research, seminars, cultural activities, and collaborative
                            learning sessions.
                        </p>
                    </div> -->
                </section>
                
            </div>
            <!-- Sidebar -->
            <aside class="dept-sidebar">
                <div class="side-card"
                    style="padding: 24px; border-radius: var(--radius); box-shadow: var(--shadow2); border: 1px solid var(--stroke); background: var(--card);">
                    <h3
                        style="margin-top: 0; color: var(--secondary); font-size: 20px; border-bottom: 1px solid var(--stroke); padding-bottom: 12px; margin-bottom: 20px;">
                        Department Faculties</h3>

                    <div class="faculty-item">
                        <div class="faculty-avatar">DR</div>
                        <div class="faculty-info">
                            <h5>Dr. Radhakrishnan P.</h5>
                            <p>Head of Department</p>
                        </div>
                    </div>

                    <div class="faculty-item">
                        <div class="faculty-avatar">SM</div>
                        <div class="faculty-info">
                            <h5>Dr. Suma Menon</h5>
                            <p>Associate Professor</p>
                        </div>
                    </div>

                    <div class="faculty-item">
                        <div class="faculty-avatar">AK</div>
                        <div class="faculty-info">
                            <h5>Dr. Anitha Kumar</h5>
                            <p>Assistant Professor</p>
                        </div>
                    </div>

                    <div class="faculty-item">
                        <div class="faculty-avatar">VN</div>
                        <div class="faculty-info">
                            <h5>Dr. Vineeth Nair</h5>
                            <p>Assistant Professor</p>
                        </div>
                    </div>

                    <a href="#" class="btn btn-small"
                        style="width: 100%; justify-content: center; margin-top: 15px;">View All Faculty</a>
                </div>
                <div class="side-card"
                    style="padding: 24px; border-radius: var(--radius); margin: 30px 0; box-shadow: var(--shadow2); border: 1px solid var(--stroke); background: var(--card);">
                    <h3
                        style="margin-top: 0; color: var(--secondary); font-size: 20px; border-bottom: 1px solid var(--stroke); padding-bottom: 12px; margin-bottom: 20px;">
                        Social Activities</h3>

                    <div class="activity-item">
                        <div class="activity-icon">🎉</div>
                        <div class="activity-content">
                            <h5>Cultural Fest 2024</h5>
                            <p>Annual department cultural celebration with performances and competitions</p>
                        </div>
                    </div>

                    <div class="activity-item">
                        <div class="activity-icon">🌱</div>
                        <div class="activity-content">
                            <h5>Community Outreach Program</h5>
                            <p>Language preservation initiative in rural areas</p>
                        </div>
                    </div>

                    <div class="activity-item">
                        <div class="activity-icon">🏆</div>
                        <div class="activity-content">
                            <h5>Inter-University Debate</h5>
                            <p>Students won first prize in Malayalam linguistics debate</p>
                        </div>
                    </div>

                    <div class="activity-item">
                        <div class="activity-icon">📚</div>
                        <div class="activity-content">
                            <h5>Book Release Event</h5>
                            <p>Launch of department's research anthology</p>
                        </div>
                    </div>

                    <a href="#" class="btn btn-small"
                        style="width: 100%; justify-content: center; margin-top: 15px;">View All Activities</a>
                </div>

                <div class="side-card">
                    <h3
                        style="margin-top: 0; color: var(--secondary); font-size: 20px; border-bottom: 1px solid var(--stroke); padding-bottom: 12px; margin-bottom: 20px;">
                        Scholarships & Financial Support</h3>
                    <div
                        style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        <div
                            style="padding: 12px; background: var(--bg0); border-radius: 8px; border: 1px solid var(--stroke);">
                            <div style="margin-bottom: 8px;">
                                <span class="badge badge-success">Active</span>
                            </div>
                            <h4 style="margin: 0 0 4px 0; font-size: 15px;">UGC-NET Fellowship</h4>
                            <p style="margin: 0; font-size: 13px; color: var(--muted);">For PhD scholars</p>
                        </div>
                        <div
                            style="padding: 12px; background: var(--bg0); border-radius: 8px; border: 1px solid var(--stroke);">
                            <div style="margin-bottom: 8px;">
                                <span class="badge badge-success">Active</span>
                            </div>
                            <h4 style="margin: 0 0 4px 0; font-size: 15px;">Merit Scholarship</h4>
                            <p style="margin: 0; font-size: 13px; color: var(--muted);">Top 10% students</p>
                        </div>
                        <div
                            style="padding: 12px; background: var(--bg0); border-radius: 8px; border: 1px solid var(--stroke);">
                            <div style="margin-bottom: 8px;">
                                <span class="badge badge-info">Available</span>
                            </div>
                            <h4 style="margin: 0 0 4px 0; font-size: 15px;">Research Grants</h4>
                            <p style="margin: 0; font-size: 13px; color: var(--muted);">Project-based funding
                            </p>
                        </div>
                    </div>
                </div>

                
            </aside>

        </div>
        <!-- Video Gallery -->
        <section id="videos" style="margin-bottom: 50px;">
            <div class="section-head">
                <h2>Video Gallery</h2>
            </div>
            <div class="owl-carousel owl-theme video-carousel">
                <div class="item">
                    <a class="popup-youtube media-item" href="https://www.youtube.com/watch?v=4b833fSdlZI">
                        <img src="https://img.youtube.com/vi/4b833fSdlZI/hqdefault.jpg" alt="Video Thumb">
                        <div class="play-icon">▶</div>
                        <div class="media-caption">Department Seminar 2024</div>
                    </a>
                </div>
                <div class="item">
                    <a class="popup-youtube media-item" href="https://www.youtube.com/watch?v=UqG9bHHGKZA">
                        <img src="https://img.youtube.com/vi/UqG9bHHGKZA/hqdefault.jpg" alt="Video Thumb">
                        <div class="play-icon">▶</div>
                        <div class="media-caption">Linguistic Fieldwork Documentary</div>
                    </a>
                </div>
                <div class="item">
                    <a class="popup-youtube media-item" href="https://www.youtube.com/watch?v=_vrDek-o5Zw">
                        <img src="https://img.youtube.com/vi/_vrDek-o5Zw/hqdefault.jpg" alt="Video Thumb">
                        <div class="play-icon">▶</div>
                        <div class="media-caption">Student Interactions</div>
                    </a>
                </div>
                 <div class="item">
                    <a class="popup-youtube media-item" href="https://www.youtube.com/watch?v=1lUERgzD4K8">
                        <img src="https://img.youtube.com/vi/1lUERgzD4K8/hqdefault.jpg" alt="Video Thumb">
                        <div class="play-icon">▶</div>
                        <div class="media-caption">Student Interactions</div>
                    </a>
                </div>
            </div>
        </section>

        <!-- Image Gallery -->
        <section id="gallery" style="margin-bottom: 30px;">
            <div class="section-head">
                <h2>Image Gallery</h2>
            </div>
            <div class="owl-carousel owl-theme image-carousel">
                <div class="item">
                    <a class="popup-image media-item" href="images/slider.jpg" title="Campus View">
                        <img src="images/slider.jpg" alt="Campus">
                        <div class="media-caption">Language Lab</div>
                    </a>
                </div>
                <div class="item">
                    <a class="popup-image media-item" href="images/slider2.jpg" title="Seminar Hall">
                        <img src="images/slider2.jpg" alt="Seminar">
                        <div class="media-caption">National Seminar</div>
                    </a>
                </div>
                <div class="item">
                    <a class="popup-image media-item" href="images/slider.jpg" title="Library">
                        <img src="images/slider.jpg" alt="Library">
                        <div class="media-caption">Department Library</div>
                    </a>
                </div>
                <div class="item">
                    <a class="popup-image media-item" href="images/slider2.jpg" title="Classroom">
                        <img src="images/slider2.jpg" alt="Classroom">
                        <div class="media-caption">Smart Classroom</div>
                    </a>
                </div>
            </div>
        </section>
    </div>
</main>

<!-- FOOTER (Copied from index.html) -->

<?php include 'footer.php'; ?>

<div class="toast" id="toast" role="status" aria-live="polite"></div>
 <!-- Owl Carousel CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css">
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css">

    <!-- Magnific Popup CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/magnific-popup.min.css">

<!-- Scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/jquery.magnific-popup.min.js"></script>

<script>
    // Helpers (Copied from index.html)
    const qs = (q, root = document) => root.querySelector(q);
    const qsa = (q, root = document) => Array.from(root.querySelectorAll(q));

    function showToast(message) {
        const t = qs("#toast");
        t.innerHTML = `<strong>Info:</strong> ${message}`;
        t.classList.add("show");
        clearTimeout(window.__toastTimer);
        window.__toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
    }

    // Year
    qs("#year").textContent = new Date().getFullYear();

    // Desktop dropdown handling
    const ddItems = qsa("[data-dd]");
    function closeAllDropdowns() {
        ddItems.forEach(i => i.classList.remove("open"));
        ddItems.forEach(i => {
            const btn = i.querySelector(".nav-link[role='button']");
            if (btn) btn.setAttribute("aria-expanded", "false");
        });
    }

    ddItems.forEach(item => {
        const btn = item.querySelector(".nav-link[role='button']");
        const drop = item.querySelector(".dropdown");
        const mega = item.querySelector(".megamenu");
        const menu = drop || mega; // Combined logic to handle both

        if (!btn || !menu) return;

        const open = () => {
            closeAllDropdowns();
            item.classList.add("open");
            btn.setAttribute("aria-expanded", "true");
        };
        const toggle = () => {
            const isOpen = item.classList.contains("open");
            closeAllDropdowns();
            if (!isOpen) {
                item.classList.add("open");
                btn.setAttribute("aria-expanded", "true");
            }
        };

        btn.addEventListener("click", (e) => { e.preventDefault(); toggle(); });
        btn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle();
            }
            if (e.key === "Escape") {
                closeAllDropdowns();
                btn.blur();
            }
        });

        // Keep open when hovering (desktop feel)
        item.addEventListener("mouseenter", () => open());
        item.addEventListener("mouseleave", () => closeAllDropdowns());
    });

    document.addEventListener("click", (e) => {
        if (!e.target.closest("[data-dd]")) closeAllDropdowns();
    });

    // Mobile menu
    const burger = qs("#burger");
    const sheet = qs("#mobileSheet"); // Note: Assuming sheet exists in DOM or we should add it if we want full mobile support.
    // For now, retaining script but sheet HTML isn't in template. If mobile menu needed, add sheet markup.
    // The original index.html has a sheet div. We should probably add it to be safe, but for now just the button logic is here.

    // Fake language toggle (demo)
    const langToggle = qs("#langToggle");
    const langLabel = qs("#langLabel");
    let lang = "ML";
    langToggle?.addEventListener("click", () => {
        lang = (lang === "ML") ? "EN" : "ML";
        langLabel.textContent = lang;
        showToast(`Language switched to ${lang} (demo). Content can be loaded from bilingual CMS fields.`);
    });

    // --- Custom Department Page Scripts ---
    $(document).ready(function () {
        // Video Carousel
        $(".video-carousel").owlCarousel({
            loop: true,
            margin: 20,
            nav: true,
            dots: false,
            navText: ['<', '>'],
            responsive: {
                0: { items: 1 },
                600: { items: 2 },
                1000: { items: 3 }
            }
        });

        // Image Carousel
        $(".image-carousel").owlCarousel({
            loop: true,
            margin: 20,
            nav: true,
            dots: false,
            navText: ['<', '>'],
            responsive: {
                0: { items: 1 },
                600: { items: 2 },
                1000: { items: 3 }
            }
        });

        // Magnific Popup for Videos
        $('.popup-youtube').magnificPopup({
            disableOn: 700,
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,
            fixedContentPos: false
        });

        // Magnific Popup for Images
        $('.popup-image').magnificPopup({
            type: 'image',
            closeOnContentClick: true,
            mainClass: 'mfp-img-mobile',
            image: {
                verticalFit: true
            }
        });
    });
</script>
</body>

</html>