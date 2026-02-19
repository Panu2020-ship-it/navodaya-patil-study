/* ============================================
   NAVODAYA NEWS & UPDATES MODULE
   Bilingual (Marathi + Semi-English)
   Categories: admission, exam, results, circulars
   ============================================ */

const NewsModule = (() => {

    // ── NEWS DATA STORE ────────────────────────────────────────────────────────
    // Each item: { id, category, badge, title_mr, title_en, summary_mr, summary_en,
    //              body_mr, body_en, date, important, pinned }
    // badge values: 'important' | 'new' | '' (empty = normal)
    let newsData = JSON.parse(localStorage.getItem('nav_news_data') || 'null') || [
        {
            id: 'n001',
            category: 'admission',
            badge: 'important',
            title_mr: 'नवोदय प्रवेश परीक्षा 2026 – अर्ज सुरू!',
            title_en: 'Navodaya Admission Form 2026 – Open Now!',
            summary_mr: 'जवाहर नवोदय विद्यालय इयत्ता ६ वी प्रवेशासाठी अर्ज भरण्यास सुरुवात झाली आहे. अंतिम तारीख चुकवू नका.',
            summary_en: 'JNVST Class 6 admission forms are now open. Fill before the last date to avoid rejection.',
            body_mr: `जवाहर नवोदय विद्यालय (JNV) इयत्ता ६ वी प्रवेश परीक्षेसाठी २०२६-२७ साठी ऑनलाईन अर्ज सुरू झाले आहेत.\n\n📋 <strong>महत्त्वाची माहिती:</strong>\n• अर्ज वेबसाईट: navodaya.gov.in\n• अर्जाची अंतिम तारीख: ३१ जानेवारी २०२६\n• परीक्षा दिनांक: एप्रिल २०२६\n• वय मर्यादा: ०१ मे २०१४ ते ३१ जुलै २०१५ दरम्यान जन्मलेले\n\n📌 <strong>आवश्यक कागदपत्रे:</strong>\n• जन्म दाखला\n• शाळेचा इयत्ता ५ वी चा बोनाफाईड सर्टिफिकेट\n• पासपोर्ट फोटो\n• आधार कार्ड`,
            body_en: `JNV Entrance Test (JNVST) online forms for Class 6 (Session 2026-27) are now available.\n\n📋 <strong>Key Details:</strong>\n• Website: navodaya.gov.in\n• Last Date to Apply: 31 Jan 2026\n• Exam Date: April 2026\n• Age: Born between 01 May 2014 – 31 July 2015\n\n📌 <strong>Required Documents:</strong>\n• Birth Certificate\n• Class 5 school bonafide\n• Passport size photo\n• Aadhaar Card`,
            date: '2026-01-10',
            important: true,
            pinned: true
        },
        {
            id: 'n002',
            category: 'exam',
            badge: 'new',
            title_mr: 'नवोदय परीक्षा वेळापत्रक – एप्रिल २०२६',
            title_en: 'JNVST Exam Schedule – April 2026',
            summary_mr: 'इयत्ता ६ वी नवोदय प्रवेश परीक्षेचे वेळापत्रक जाहीर झाले आहे. परीक्षा केंद्र व वेळ पहा.',
            summary_en: 'JNVST Class 6 exam schedule has been released. Check your exam centre and timing.',
            body_mr: `नवोदय विद्यालय समिती (NVS) ने इयत्ता ६ वी प्रवेश परीक्षेचे वेळापत्रक जाहीर केले आहे.\n\n⏰ <strong>परीक्षा वेळ:</strong>\n• तारीख: शनिवार, ५ एप्रिल २०२६\n• वेळ: सकाळी ११:३० ते दुपारी १:३०\n• एकूण वेळ: २ तास\n\n📊 <strong>परीक्षा पॅटर्न:</strong>\n• मानसिक क्षमता: ४० प्रश्न – ५० गुण\n• अंकगणित: २० प्रश्न – २५ गुण\n• भाषा चाचणी: २० प्रश्न – २५ गुण\n• एकूण: ८० प्रश्न – १०० गुण`,
            body_en: `NVS has officially released the JNVST Class 6 exam timetable for 2026.\n\n⏰ <strong>Exam Timing:</strong>\n• Date: Saturday, 5 April 2026\n• Time: 11:30 AM – 1:30 PM\n• Duration: 2 Hours\n\n📊 <strong>Exam Pattern:</strong>\n• Mental Ability: 40 Q – 50 Marks\n• Arithmetic: 20 Q – 25 Marks\n• Language Test: 20 Q – 25 Marks\n• Total: 80 Q – 100 Marks`,
            date: '2026-01-20',
            important: false,
            pinned: false
        },
        {
            id: 'n003',
            category: 'admission',
            badge: '',
            title_mr: 'इयत्ता ४ थी प्रवेश – महाराष्ट्र बोर्ड अपडेट',
            title_en: 'Class 4 Admission – Maharashtra Board Update',
            summary_mr: 'महाराष्ट्र राज्य मंडळाने इयत्ता ४ थी प्रवेशासाठी नवीन नियम जाहीर केले. अर्ज प्रक्रिया ऑनलाईन असेल.',
            summary_en: 'Maharashtra State Board announced new rules for Class 4 admissions. Process will be online.',
            body_mr: `महाराष्ट्र शासनाच्या शिक्षण विभागाने इयत्ता ४ थी प्रवेशाबाबत नवीन परिपत्रक जाहीर केले आहे.\n\n📝 <strong>महत्त्वाचे मुद्दे:</strong>\n• प्रवेश प्रक्रिया आता पूर्णपणे ऑनलाईन\n• RTE अंतर्गत २५% जागा राखीव\n• वयाची अट: ३१ जुलैपर्यंत ६ वर्षे पूर्ण\n• आवश्यक: जन्म दाखला, रेशन कार्ड`,
            body_en: `Maharashtra Education Dept. issued a new circular for Class 4 admissions.\n\n📝 <strong>Key Points:</strong>\n• Admission process is now fully online\n• 25% seats reserved under RTE\n• Age criteria: 6 years by 31 July\n• Required: Birth certificate, Ration card`,
            date: '2025-12-15',
            important: false,
            pinned: false
        },
        {
            id: 'n004',
            category: 'results',
            badge: 'important',
            title_mr: 'नवोदय निकाल २०२५ – यादी जाहीर',
            title_en: 'Navodaya Result 2025 – Selection List Released',
            summary_mr: '२०२५ च्या JNVST परीक्षेचे निकाल जाहीर झाले आहेत. नवोदय वेबसाईटवर नाव तपासा.',
            summary_en: 'JNVST 2025 results are out! Check the merit list on the official Navodaya website.',
            body_mr: `NVS ने JNVST २०२५ च्या निकालाची प्रतीक्षा यादी (Waiting List) व मुख्य यादी जाहीर केली आहे.\n\n✅ <strong>निकाल कसा पहाल:</strong>\n१. navodaya.gov.in वर जा\n२. 'Result' विभागावर क्लिक करा\n३. आपला जिल्हा व रोल नंबर टाका\n४. निकाल डाउनलोड करा\n\n📞 <strong>माहिती केंद्र:</strong>\nNVS Helpline: 0120-4116902`,
            body_en: `NVS released the Main Selection List and Waiting List for JNVST 2025.\n\n✅ <strong>How to Check:</strong>\n1. Visit navodaya.gov.in\n2. Click on 'Result'\n3. Enter District & Roll Number\n4. Download result\n\n📞 <strong>Helpline:</strong>\nNVS: 0120-4116902`,
            date: '2025-11-05',
            important: true,
            pinned: false
        },
        {
            id: 'n005',
            category: 'exam',
            badge: 'new',
            title_mr: 'प्रवेशपत्र (Admit Card) डाउनलोड – JNVST २०२६',
            title_en: 'Admit Card Download Open – JNVST 2026',
            summary_mr: 'नवोदय परीक्षेचे प्रवेशपत्र आता उपलब्ध आहे. परीक्षेपूर्वी डाउनलोड करून प्रिंट ठेवा.',
            summary_en: 'JNVST 2026 Admit Cards are now available for download. Print before the exam day.',
            body_mr: `JNVST २०२६ साठी प्रवेशपत्र (Hall Ticket) उपलब्ध झाले आहे.\n\n🪪 <strong>डाउनलोड प्रक्रिया:</strong>\n१. navodaya.gov.in वर जा\n२. 'Admit Card' वर क्लिक करा\n३. रोल नंबर आणि जन्मतारीख टाका\n४. डाउनलोड व प्रिंट करा\n\n⚠️ <strong>महत्त्वाचे:</strong>\n• प्रवेशपत्राशिवाय प्रवेश मिळणार नाही\n• एक फोटो ओळखपत्र सोबत आणा\n• काळी/निळी बॉलपेन आणा`,
            body_en: `JNVST 2026 Hall Tickets (Admit Cards) are now available.\n\n🪪 <strong>Download Steps:</strong>\n1. Visit navodaya.gov.in\n2. Click 'Admit Card'\n3. Enter Roll Number & Date of Birth\n4. Download and print\n\n⚠️ <strong>Important:</strong>\n• Entry NOT allowed without Admit Card\n• Carry one valid Photo ID\n• Bring black/blue ballpen`,
            date: '2026-02-01',
            important: true,
            pinned: true
        },
        {
            id: 'n006',
            category: 'circulars',
            badge: '',
            title_mr: 'NVS परिपत्रक: शाळा अनुदान व सुविधा 2026',
            title_en: 'NVS Circular: School Grants & Facilities 2026',
            summary_mr: 'नवोदय विद्यालय समितीने विद्यार्थ्यांसाठी नवीन सुविधा व शिष्यवृत्ती योजना जाहीर केल्या.',
            summary_en: 'NVS issued a circular on new student facilities, scholarships and infrastructure grants.',
            body_mr: `NVS ने शैक्षणिक वर्ष २०२६-२७ साठी नवीन परिपत्रक जाहीर केले.\n\n🏫 <strong>नवीन सुविधा:</strong>\n• प्रत्येक JNV मध्ये स्मार्ट क्लासरूम\n• डिजिटल लायब्ररी उपकरणे\n• खेळाडूंसाठी स्पोर्ट्स ग्रँट\n\n💰 <strong>शिष्यवृत्ती:</strong>\n• देशपातळी: ₹१२०० प्रति माह\n• राज्यपातळी: ₹६०० प्रति माह`,
            body_en: `NVS released a new circular for academic year 2026-27.\n\n🏫 <strong>New Facilities:</strong>\n• Smart classrooms in every JNV\n• Digital library equipment\n• Sports grants for athletes\n\n💰 <strong>Scholarships:</strong>\n• National Level: ₹1200/month\n• State Level: ₹600/month`,
            date: '2025-12-01',
            important: false,
            pinned: false
        },
        {
            id: 'n007',
            category: 'results',
            badge: '',
            title_mr: 'इयत्ता ४ थी श्रेणी ठरवण्याचे निकष – २०२५',
            title_en: 'Class 4 Grading Criteria – 2025 Update',
            summary_mr: 'महाराष्ट्र बोर्डाने इयत्ता ४ थी वार्षिक परीक्षेचे नवीन मूल्यमापन निकष जाहीर केले आहेत.',
            summary_en: 'Maharashtra Board announced new evaluation norms for Class 4 annual exams 2025.',
            body_mr: `महाराष्ट्र राज्य शैक्षणिक संशोधन व प्रशिक्षण परिषद (SCERT) ने इयत्ता ४ थी मूल्यमापन नीती अद्ययावत केली आहे.\n\n📊 <strong>नवीन निकष:</strong>\n• सातत्यपूर्ण सर्वांगीण मूल्यमापन (CCE): ४०%\n• वार्षिक परीक्षा: ६०%\n• उपस्थिती: किमान ७५% आवश्यक`,
            body_en: `SCERT Maharashtra updated the assessment policy for Class 4 annual exams.\n\n📊 <strong>New Criteria:</strong>\n• Continuous Comprehensive Evaluation (CCE): 40%\n• Annual Exam: 60%\n• Attendance: Minimum 75% required`,
            date: '2025-10-10',
            important: false,
            pinned: false
        },
        {
            id: 'n008',
            category: 'circulars',
            badge: 'new',
            title_mr: 'परीक्षा केंद्र बदल – JNVST २०२६ सूचना',
            title_en: 'Exam Centre Change Notice – JNVST 2026',
            summary_mr: 'काही जिल्ह्यांमध्ये परीक्षा केंद्र बदलण्यात आले आहे. आपले प्रवेशपत्र नीट तपासा.',
            summary_en: 'Exam centres changed in select districts. Verify your admit card carefully before the exam.',
            body_mr: `NVS ने काही जिल्ह्यांतील परीक्षा केंद्रे बदलल्याची सूचना जारी केली आहे.\n\n⚠️ <strong>प्रभावित जिल्हे:</strong>\n• पुणे – नवीन केंद्र: महाराष्ट्र विद्यालय, शिवाजीनगर\n• नाशिक – नवीन केंद्र: जिल्हा परिषद शाळा, सिन्नर\n• औरंगाबाद – नवीन केंद्र: JNV औरंगाबाद\n\n✅ आपले प्रवेशपत्र पुन्हा डाउनलोड करा.`,
            body_en: `NVS issued a notice regarding exam centre changes in select districts.\n\n⚠️ <strong>Affected Districts:</strong>\n• Pune – New Centre: Maharashtra Vidyalaya, Shivajinagar\n• Nashik – New Centre: ZP School, Sinnar\n• Aurangabad – New Centre: JNV Aurangabad\n\n✅ Re-download your Admit Card for updated details.`,
            date: '2026-02-10',
            important: true,
            pinned: false
        }
    ];

    // ── HELPERS ────────────────────────────────────────────────────────────────
    const save = () => localStorage.setItem('nav_news_data', JSON.stringify(newsData));
    const getLang = () => {
        const btn = document.getElementById('lang-btn');
        return btn && btn.querySelector('.icon-btn-text')?.innerText.trim() === 'English' ? 'en' : 'mr';
    };
    const t = (item, field) => item[`${field}_${getLang()}`] || item[`${field}_mr`];

    const badgeHTML = (badge) => {
        if (badge === 'important') return `<span class="news-badge badge-important">🔴 महत्त्वाचे</span>`;
        if (badge === 'new') return `<span class="news-badge badge-new">🟡 नवीन</span>`;
        return '';
    };

    const categoryLabel = (cat) => {
        const map = { admission: '📋 Admission', exam: '📝 Exam', results: '🏆 Results', circulars: '📌 Circular' };
        return map[cat] || cat;
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('mr-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const sorted = (list) => [...list].sort((a, b) => {
        // Pinned first, then by date desc
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.date) - new Date(a.date);
    });

    // ── HOME WIDGET (latest 3 cards) ───────────────────────────────────────────
    function renderHomeWidget() {
        const container = document.getElementById('news-home-widget');
        if (!container) return;

        const latest = sorted(newsData).slice(0, 3);
        container.innerHTML = `
            <div class="section-header">
                <h3 class="section-title">📰 बातम्या & अपडेट्स</h3>
                <button class="btn-text-link" onclick="location.hash='#news'">सर्व पहा →</button>
            </div>
            <div class="news-home-cards">
                ${latest.map(item => `
                    <div class="news-home-card ${item.important ? 'urgent' : ''}" onclick="NewsModule.openDetail('${item.id}')">
                        <div class="news-home-card-top">
                            <span class="news-cat-pill cat-${item.category}">${categoryLabel(item.category)}</span>
                            ${badgeHTML(item.badge)}
                        </div>
                        <div class="news-home-title">${t(item, 'title')}</div>
                        <div class="news-home-summary">${t(item, 'summary')}</div>
                        <div class="news-home-footer">
                            <span class="news-date">📅 ${formatDate(item.date)}</span>
                            <button class="btn btn-sm btn-primary news-read-more">Read More</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ── FULL NEWS PAGE ─────────────────────────────────────────────────────────
    function renderNewsPage(filterCat = 'all', searchQuery = '') {
        const container = document.getElementById('news');
        if (!container) return;

        let filtered = sorted(newsData);
        if (filterCat !== 'all') filtered = filtered.filter(n => n.category === filterCat);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(n =>
                t(n, 'title').toLowerCase().includes(q) ||
                t(n, 'summary').toLowerCase().includes(q)
            );
        }

        container.innerHTML = `
            <div class="news-page-header">
                <h2>📰 बातम्या & अपडेट्स</h2>
                <p>नवोदय परीक्षा व इयत्ता ४ थी बाबत सर्व महत्त्वाच्या बातम्या</p>
            </div>

            <!-- Search Bar -->
            <div class="news-search-wrap">
                <input type="text" id="news-search-inp" class="news-search-input"
                    placeholder="🔍 बातमी शोधा... (Search news...)"
                    value="${searchQuery}"
                    oninput="NewsModule.renderNewsPage('${filterCat}', this.value)" />
            </div>

            <!-- Filter Tabs -->
            <div class="news-filter-tabs">
                ${['all', 'admission', 'exam', 'results', 'circulars'].map(cat => `
                    <button class="news-filter-btn ${filterCat === cat ? 'active' : ''}"
                        onclick="NewsModule.renderNewsPage('${cat}', document.getElementById('news-search-inp').value)">
                        ${cat === 'all' ? '🗞️ सर्व' : categoryLabel(cat)}
                    </button>
                `).join('')}
            </div>

            <!-- News List -->
            <div class="news-list" id="news-list-container">
                ${filtered.length === 0 ? `
                    <div class="news-empty">
                        <div style="font-size:3rem;margin-bottom:1rem">📭</div>
                        <p>कोणतीही बातमी सापडली नाही.</p>
                    </div>
                ` : filtered.map(item => `
                    <div class="news-card ${item.important ? 'urgent' : ''}" onclick="NewsModule.openDetail('${item.id}')">
                        <div class="news-card-left">
                            <span class="news-cat-pill cat-${item.category}">${categoryLabel(item.category)}</span>
                            <h4 class="news-card-title">${t(item, 'title')}</h4>
                            <p class="news-card-summary">${t(item, 'summary')}</p>
                            <div class="news-card-meta">
                                <span class="news-date">📅 ${formatDate(item.date)}</span>
                                ${badgeHTML(item.badge)}
                                ${item.pinned ? '<span class="news-badge badge-pinned">📌 Pinned</span>' : ''}
                            </div>
                        </div>
                        <div class="news-card-right">
                            <div class="news-arrow">›</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Admin Panel Toggle -->
            <div style="text-align:center; margin-top:2rem;">
                <button class="btn btn-outline btn-sm" onclick="NewsModule.toggleAdminPanel()">⚙️ Admin Panel</button>
            </div>
            <div id="news-admin-panel" class="news-admin-panel" style="display:none;">
                ${renderAdminPanelHTML()}
            </div>
        `;
    }

    // ── DETAIL VIEW ────────────────────────────────────────────────────────────
    function openDetail(newsId) {
        const item = newsData.find(n => n.id === newsId);
        if (!item) return;

        const container = document.getElementById('news');
        container.innerHTML = `
            <button class="btn btn-outline btn-sm mb-2" onclick="NewsModule.renderNewsPage()">← परत जा (Back)</button>
            <div class="news-detail-card">
                <div class="news-detail-header">
                    <span class="news-cat-pill cat-${item.category}">${categoryLabel(item.category)}</span>
                    ${badgeHTML(item.badge)}
                    ${item.pinned ? '<span class="news-badge badge-pinned">📌 Pinned</span>' : ''}
                </div>
                <h2 class="news-detail-title">${t(item, 'title')}</h2>
                <div class="news-detail-date">📅 ${formatDate(item.date)}</div>
                <div class="news-detail-body">${t(item, 'body').replace(/\n/g, '<br>')}</div>

                <!-- Language Toggle inside detail -->
                <div class="news-detail-lang-row">
                    <button class="btn btn-outline btn-sm" onclick="NewsModule.openDetail('${item.id}')">🔄 भाषा बदला</button>
                    <button class="btn btn-primary btn-sm" onclick="NewsModule.renderNewsPage()">← बातम्यांकडे परत</button>
                </div>
            </div>

            <!-- Related News -->
            <h3 class="mt-2 mb-2">संबंधित बातम्या</h3>
            <div class="news-related-grid">
                ${newsData
                .filter(n => n.id !== newsId && n.category === item.category)
                .slice(0, 2)
                .map(rel => `
                        <div class="news-home-card" onclick="NewsModule.openDetail('${rel.id}')">
                            <div class="news-home-card-top">
                                <span class="news-cat-pill cat-${rel.category}">${categoryLabel(rel.category)}</span>
                            </div>
                            <div class="news-home-title">${t(rel, 'title')}</div>
                            <div class="news-home-footer">
                                <span class="news-date">📅 ${formatDate(rel.date)}</span>
                            </div>
                        </div>
                    `).join('') || '<p>इतर बातम्या उपलब्ध नाहीत.</p>'}
            </div>
        `;
        window.scrollTo(0, 0);
    }

    // ── ADMIN PANEL ────────────────────────────────────────────────────────────
    function renderAdminPanelHTML() {
        return `
            <h3 class="mb-2">⚙️ Admin: बातम्या व्यवस्थापन</h3>
            <div class="admin-form card">
                <h4>नवीन बातमी जोडा / Add New</h4>
                <input type="text" id="admin-title-mr" class="admin-input" placeholder="शीर्षक (मराठी)" />
                <input type="text" id="admin-title-en" class="admin-input" placeholder="Title (English)" />
                <textarea id="admin-summary-mr" class="admin-input" rows="2" placeholder="थोडक्यात माहिती (मराठी)"></textarea>
                <textarea id="admin-summary-en" class="admin-input" rows="2" placeholder="Summary (English)"></textarea>
                <textarea id="admin-body-mr" class="admin-input" rows="4" placeholder="संपूर्ण माहिती (मराठी)"></textarea>
                <textarea id="admin-body-en" class="admin-input" rows="4" placeholder="Full Body (English)"></textarea>
                <div class="admin-row">
                    <select id="admin-category" class="admin-input">
                        <option value="admission">Admission</option>
                        <option value="exam">Exam</option>
                        <option value="results">Results</option>
                        <option value="circulars">Circulars</option>
                    </select>
                    <select id="admin-badge" class="admin-input">
                        <option value="">Normal</option>
                        <option value="important">🔴 Important</option>
                        <option value="new">🟡 New</option>
                    </select>
                    <input type="date" id="admin-date" class="admin-input" />
                </div>
                <div class="admin-row">
                    <label><input type="checkbox" id="admin-important"> Important</label>
                    <label><input type="checkbox" id="admin-pinned"> Pinned</label>
                </div>
                <button class="btn btn-primary mt-2" onclick="NewsModule.adminAdd()">➕ बातमी जोडा</button>
            </div>

            <h4 class="mt-2 mb-2">सर्व बातम्या (${newsData.length})</h4>
            ${newsData.map(n => `
                <div class="admin-news-row">
                    <div class="admin-news-info">
                        <span class="news-cat-pill cat-${n.category}">${n.category}</span>
                        <span>${n.title_mr}</span>
                        <span class="news-date" style="font-size:0.75rem">${n.date}</span>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="NewsModule.adminDelete('${n.id}')">🗑️</button>
                </div>
            `).join('')}
        `;
    }

    function toggleAdminPanel() {
        const panel = document.getElementById('news-admin-panel');
        if (!panel) return;
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    function adminAdd() {
        const get = (id) => document.getElementById(id)?.value.trim();
        const titleMr = get('admin-title-mr');
        const titleEn = get('admin-title-en');
        if (!titleMr || !titleEn) { alert('कृपया मराठी आणि इंग्रजी शीर्षक भरा.'); return; }

        const newItem = {
            id: 'n' + Date.now(),
            category: get('admin-category') || 'exam',
            badge: get('admin-badge') || '',
            title_mr: titleMr,
            title_en: titleEn,
            summary_mr: get('admin-summary-mr') || '',
            summary_en: get('admin-summary-en') || '',
            body_mr: get('admin-body-mr') || '',
            body_en: get('admin-body-en') || '',
            date: get('admin-date') || new Date().toISOString().split('T')[0],
            important: document.getElementById('admin-important')?.checked || false,
            pinned: document.getElementById('admin-pinned')?.checked || false
        };
        newsData.unshift(newItem);
        save();
        renderNewsPage();
        alert('✅ बातमी यशस्वीपणे जोडली गेली!');
    }

    function adminDelete(newsId) {
        if (!confirm('ही बातमी हटवायची आहे का?')) return;
        newsData = newsData.filter(n => n.id !== newsId);
        save();
        renderNewsPage();
    }

    // ── PUBLIC API ─────────────────────────────────────────────────────────────
    return {
        renderHomeWidget,
        renderNewsPage,
        openDetail,
        toggleAdminPanel,
        adminAdd,
        adminDelete
    };

})();
