# Implementation Roadmap & Execution Plan

**Date:** February 2026  
**Project:** MBA Portal Architecture Redesign  
**Status:** Ready for Sprint Planning

---

## STRATEGIC SHIFT SUMMARY

| Aspect | Current | New |
|--------|---------|-----|
| **Entry Point** | Requires email + OTP signup | Browse anonymously, zero friction |
| **Core Value** | GD/PI interview prep | MBA News & Gossip aggregation |
| **Profile Requirement** | Mandatory (10th/12th/Grad marks) | Optional (helpful but not required) |
| **College Database** | ~5 hardcoded colleges | 200+ indexed colleges across 4 tiers |
| **Content Source** | Static GD topics | Real-time scraped from Reddit, news |
| **Key Success Metric** | Profile completion rate | Monthly active users & page views |
| **SEO Strategy** | Limited (no college pages) | 200+ college detail pages + news feed |

---

## CRITICAL REQUIREMENTS CHECKLIST

### Business Requirements
- [ ] **De-emphasis Profile:** No marks required to view content
- [ ] **Zero Friction:** Homepage should allow immediate college browsing
- [ ] **Comprehensive Database:** 200+ colleges indexed
- [ ] **Content Freshness:** Real-time news aggregation (6-12h refresh)
- [ ] **Tier-based Organization:** Clear categorization (Tier-1 Blacki, IIT MBAs, etc.)
- [ ] **SEO Optimization:** College detail pages + trending news for Google
- [ ] **Social Proof:** Reddit metrics (scores, comments) displayed prominently

### Technical Requirements
- [ ] **Scraper Pipeline:** Automated post to MongoDB
- [ ] **Deduplication Engine:** Prevent article spam
- [ ] **NLP College Recognition:** Automatic college tagging
- [ ] **Content Classification:** Placement/Controversy/Ragging detection
- [ ] **Performance:** < 200ms response for college list
- [ ] **Scalability:** Support 10K+ articles, 100K+ monthly users

---

## PHASED IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Database + Models ready, static colleges seeded

#### Week 1
- [ ] Create `colleges` collection with proper schema
- [ ] Create `news_articles` collection with schema
- [ ] Update `users` collection (make profile optional)
- [ ] Create seed script with 60+ colleges

**Deliverables:**
- MongoDB collections initialized
- 60+ colleges seeded (Tier-1 and Tier-2 focus)
- Index strategy implemented
- Data model documentation ✓ (See DATABASE_SCHEMAS.md)

**Time Estimate:** 3-4 days

**Owner:** Database Architecture Lead

---

#### Week 2
- [ ] Create CollegeModel with all methods (search, filter, trending)
- [ ] Create NewsArticleModel with storage/retrieval methods
- [ ] Create ScraperLogModel for monitoring
- [ ] Update UserModel for optional profile
- [ ] Write unit tests for models

**Deliverables:**
- All models implemented and tested
- CRUD operations verified
- Sample queries documented

**Time Estimate:** 3-4 days

**Owner:** Backend Developer

---

### Phase 2: Public API (Weeks 3-4)
**Goal:** Public content discovery routes live

#### Week 3
- [ ] Implement GET /api/colleges (with filtering, sorting)
- [ ] Implement GET /api/colleges/:id (detail page)
- [ ] Implement GET /api/colleges/search
- [ ] Implement pagination framework
- [ ] Add caching layer (Redis optional)

**Deliverables:**
- College discovery fully functional
- All filters tested
- Performance benchmarking (<200ms)

**Time Estimate:** 3 days

**Owner:** API Developer

---

#### Week 4
- [ ] Implement GET /api/news (main feed)
- [ ] Implement GET /api/colleges/:id/news (college-specific)
- [ ] Implement GET /api/trending-colleges
- [ ] Implement GET /api/featured
- [ ] Full-text search on articles

**Deliverables:**
- News feed API fully functional
- Trending algorithm working
- Admin can feature articles

**Time Estimate:** 3 days

**Owner:** API Developer

---

### Phase 3: Authentication & Preferences (Week 5)
**Goal:** Optional auth system, bookmarks, favorites

- [ ] Update POST /auth/request-otp (no profile requirement messaging)
- [ ] Update POST /auth/verify-otp
- [ ] Implement POST /auth/complete-profile (optional marks)
- [ ] Implement bookmarks system (GET, POST, DELETE)
- [ ] Implement favorite colleges system

**Deliverables:**
- Auth flow allows profile skipping
- Bookmark/favorite functionality working
- User preferences stored

**Time Estimate:** 3-4 days

**Owner:** Backend Developer

---

### Phase 4: Scraper System (Weeks 6-7)
**Goal:** Automated content aggregation running

#### Week 6 - Reddit Scraper
- [ ] Implement reddit-scraper.js
- [ ] Implement college mention extraction (with aliases)
- [ ] Implement content classification (placement/controversy/etc)
- [ ] Implement basic sentiment analysis
- [ ] Test with 100 Reddit posts manually

**Deliverables:**
- Reddit scraper can extract posts
- College tagging working correctly
- Content classification 80%+ accurate

**Time Estimate:** 4 days

**Owner:** Scraper Development Lead

---

#### Week 7 - News Scraper + Dedup
- [ ] Implement news-scraper.js (3-5 news sources)
- [ ] Implement deduplication engine
- [ ] Set up node-cron scheduling
- [ ] Implement scraper monitoring endpoint
- [ ] Test full pipeline with 200 articles

**Deliverables:**
- News scraper working on schedule
- Duplicate detection working
- Scraper health check operational

**Time Estimate:** 3-4 days

**Owner:** Scraper Development Lead

---

### Phase 5: Frontend Redesign (Weeks 8-9)
**Goal:** Public landing page + college discovery UI

#### Week 8
- [ ] Design homepage (hero + trending + filters)
- [ ] Create college directory grid view
- [ ] Implement search/filter UI
- [ ] Create college detail page layout
- [ ] Responsive design for mobile

**Deliverables:**
- Homepage mockups approved
- College pages functional
- Mobile optimized

**Time Estimate:** 3-4 days

**Owner:** Frontend Developer

---

#### Week 9
- [ ] Build news feed UI (list + filters)
- [ ] Create trending sidebar
- [ ] Build bookmarks UI (for logged-in users)
- [ ] Update auth flow UX (profile skippable)
- [ ] SEO optimization (meta tags, structured data)

**Deliverables:**
- All public pages functional
- News feed working end-to-end
- SEO tags implemented

**Time Estimate:** 3-4 days

**Owner:** Frontend Developer

---

### Phase 6: Launch Preparation (Weeks 10-11)
**Goal:** Go-live ready, monitoring in place

#### Week 10
- [ ] Load testing (1000+ concurrent users)
- [ ] Security audit (SQLi, XSS, auth)
- [ ] Data migration (backup current state)
- [ ] Scraper accuracy validation
- [ ] Performance optimization

**Deliverables:**
- Load test report
- Security assessment complete
- Performance tuning done

**Time Estimate:** 3-4 days

**Owner:** DevOps + QA Lead

---

#### Week 11
- [ ] Final integration testing
- [ ] Documentation completion
- [ ] Team training on new features
- [ ] Staging environment verified
- [ ] Runbook prepared for launch day

**Deliverables:**
- All tests passing
- Documentation complete
- Team ready
- Deployment plan finalized

**Time Estimate:** 3 days

**Owner:** Technical Lead

---

### Phase 7: Launch & Monitor (Week 12+)
**Goal:** Live in production, monitor metrics

- [ ] Deploy to production
- [ ] Monitor scraper health
- [ ] Track KPIs (MAU, engagement, page views)
- [ ] Fix critical bugs
- [ ] Optimize based on user behavior

**Ongoing:**
- [ ] Expand college database to 250+
- [ ] Add more news sources
- [ ] Refine NLP accuracy
- [ ] Implement caching/CDN
- [ ] A/B test homepage layouts

---

## RESOURCE ALLOCATION

### Team Composition
| Role | FTE | Primary Focus |
|------|-----|---|
| **Backend Lead** | 1.0 | Architecture, models, APIs |
| **Backend Developer** | 1.0 | Implementation, testing |
| **Scraper Developer** | 1.0 | Reddit/News/Dedup scrapers |
| **Frontend Developer** | 0.5 | Homepage, college pages, auth UX |
| **DevOps/Infra** | 0.5 | Deployment, monitoring, performance |
| **QA/Testing** | 0.5 | Unit, integration, load testing |
| **Product Manager** | 0.5 | Requirements refinement, metrics |

**Total:** 5.0 FTE for 11-week project

---

## DEPENDENCY GRAPH

```
┌─────────────────────────────────────────┐
│      Phase 1: Foundation (DB/Models)    │ ← START
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼──────┐      ┌──────▼────────┐
│ Phase 2:     │      │ Phase 4:      │
│ Public API   │      │ Scrapers      │
│ (Colleges)   │      │ (Content)     │
└───────┬──────┘      └──────┬────────┘
        │                     │
┌───────▼────────────────────▼──────┐
│  Phase 3: Auth + Preferences      │
│  (Bookmarks, Favorites)           │
└────────────────┬───────────────────┘
                 │
         ┌───────▼─────────┐
         │ Phase 5:        │
         │ Frontend        │
         │ (UI)            │
         └───────┬─────────┘
                 │
         ┌───────▼─────────┐
         │ Phase 6:        │
         │ Testing & Perf  │
         └───────┬─────────┘
                 │
         ┌───────▼─────────┐
         │ Phase 7:        │
         │ LAUNCH          │
         └─────────────────┘
```

**Critical Path:** Phase 1 → Phase 2 → Phase 3 → Phase 5 → Phase 6 → Phase 7
**Parallel Work:** Scraper development (Phase 4) can happen parallel to Phase 2-3

---

## SUCCESS METRICS (Post-Launch)

### Month 1 (Post-Launch)
- [ ] **10,000+** unique visitors
- [ ] **200+** colleges indexed
- [ ] **1,000+** articles in database
- [ ] **98%** uptime
- [ ] **<300ms** average response time

### Month 2
- [ ] **25,000+** unique visitors
- [ ] **2,000+** articles
- [ ] **20,000+** monthly pageviews
- [ ] **50,000+** Google impressions
- [ ] **5% signup rate** (optional auth)

### Month 3 (Scale Metrics)
- [ ] **50,000+** unique visitors
- [ ] **5,000+** articles
- [ ] **100,000+** monthly pageviews
- [ ] **500,000+** impressions
- [ ] **Top 100 colleges** by organic search

### Key KPIs to Track
- **MAU (Monthly Active Users)** - target: 50K by M3
- **Pageviews per session** - target: 3+ articles per session
- **Bounce rate** - target: <50%
- **Average session duration** - target: 5+ minutes
- **Scraper freshness** - articles published within 6-12h of original
- **Content accuracy** - 90%+ college tags correct
- **Organictarget traffic** - 60%+ traffic from Google by M4

---

## RISK MITIGATION

### Risk 1: College Entity Recognition Fails
**Impact:** High (articles tagged to wrong colleges)  
**Probability:** Medium  
**Mitigation:**
- Start with 60 colleges (high-mention)
- Manual verification of first 500 articles
- Whitelist exact names + aliases
- Feedback loop to improve NLP

---

### Risk 2: Reddit API Rate Limiting
**Impact:** Medium (content flow interrupted)  
**Probability:** Medium  
**Mitigation:**
- Use official Reddit API (not PushShift)
- Implement exponential backoff
- Cache responses when possible
- Have fallback to news sources only

---

### Risk 3: News Source Scraping Breaks
**Impact:** Medium (diversity reduced)  
**Probability:** High (sites change HTML)  
**Mitigation:**
- Adopt RSS feeds prioritized
- Use Cheerio + XPath (flexible)
- Monitor scraper success rate daily
- Have 5+ fallback sources

---

### Risk 4: Database Performance Degrades
**Impact:** High (slow page loads)  
**Probability:** Low  
**Mitigation:**
- Proper indexing from start (done in Phase 1)
- Test with 10K articles in Phase 6
- Implement Redis caching
- Pagination limits (max 100 per page)

---

### Risk 5: User Adoption Low
**Impact:** Critical (business viability)  
**Probability:** Medium  
**Mitigation:**
- Launch with 200+ colleges (high coverage)
- Feature trending content prominently
- Daily content push (emails for subscribers)
- Partner with YouTube/blogs for backlinks

---

## DOCUMENTATION STATUS

✓ **ARCHITECTURE_REDESIGN.md**
- Complete strategic plan
- Database schemas
- User flows
- Content pipeline
- SEO strategy

✓ **DATABASE_SCHEMAS.md**
- Detailed MongoDB schemas
- Complete model implementations
- Seed data scripts
- Index strategy
- Migration steps

✓ **SCRAPER_ARCHITECTURE.md**
- Scraper design patterns
- Reddit implementation
- News scraper implementation
- Deduplication logic
- Scheduling strategy
- Health monitoring

✓ **API_ROUTES.md**
- Complete endpoint specifications
- Request/response examples
- Error handling
- Rate limiting
- Protected vs public routes

🔄 **Still Needed:**
- Frontend mockups/Figma designs
- Database migration scripts (from old to new)
- Performance benchmarking baseline
- Security audit checklist
- Deployment & infrastructure docs

---

## COMMUNICATION & STAKEHOLDER UPDATES

### Weekly Status Reports
- Monday: Sprint planning & capacity
- Friday: Deliverables review + next week preview

### Stakeholders to Update
- Executive Leadership (2x per week)
- Product Team (daily standup)
- Marketing (weekly for SEO progress)
- Finance (cost tracking)

### Launch Checklist
- [ ] CEO approval on strategic shift
- [ ] Marketing plan finalized
- [ ] PR/Press release drafted
- [ ] Analytics tracking configured
- [ ] Support training complete

---

## BUDGET ESTIMATE (11 Weeks)

### Engineering (Main Cost)
- 5.0 FTE @ $150K/year average = $14,300/week
- **Total Engineering:** ~$157,000

### Infrastructure
- MongoDB hosting (increased data): $500/month
- Reddit API (free tier): $0
- News source scraping (free): $0
- **Total Infra:** ~$2,750

### Tools & Services
- Sentry (error monitoring): $400/month
- New Relic (performance): $600/month
- GitHub copilot/IDE: $400/month
- **Total Tools:** ~$6,300

**Total Project Budget:** ~$166,000 (including contingency)

---

## GO/NO-GO DECISION POINTS

### End of Phase 1 (Week 2)
**Decision:** Proceed with API development?
- **GO if:** Database ready, 60+ colleges seeded, models tested
- **NO-GO if:** Data quality issues, performance problems

### End of Phase 2 (Week 4)
**Decision:** Proceed with scraper development?
- **GO if:** APIs responsive, filtering works, load tested at 1K colleges
- **NO-GO if:** Performance degrades, scalability concerns

### End of Phase 4 (Week 7)
**Decision:** Proceed with full frontend?
- **GO if:** Scraper produces quality articles, dedup working, 90%+ accuracy
- **NO-GO if:** Content quality poor, article accuracy <70%

### End of Phase 6 (Week 11)
**Decision:** Ready for production launch?
- **GO if:** All tests pass, security audit clean, KPIs on track
- **NO-GO if:** Critical bugs remain, performance issues, security gaps

---

## APPENDIX: ACRONYMS & DEFINITIONS

| Term | Definition |
|------|-----------|
| **Blacki** | The original 5 IIMs (Ahmedabad, Bangalore, Calcutta, Lucknow, Kozhikode) |
| **Baby IIMs** | Newer IIMs established post-2010 (Nagpur, Amritsar, Bodh Gaya, etc.) |
| **Tier-1** | Top-tier business schools (Blacki, New IIMs, IIT MBAs, Strategic Private) |
| **Tier-2** | Premium private institutions (XLRI, ISB, MDI, FMS, etc.) |
| **Tier-3** | Volume traffic drivers (NMIMS, SIBM, IMT, etc.) |
| **PlaceComm** | Placement results, discussion, and controversies |
| **GD War Room** | Deprecated feature: GD/PI prep war room |
| **Dedup** | Deduplication (removing duplicate articles) |
| **NLP** | Natural Language Processing (for college extraction) |
| **Fuzzy matching** | Approximate string matching (handles typos/variations) |

---

## FINAL CHECKLIST BEFORE SPRINT START

- [ ] All team members have read ARCHITECTURE_REDESIGN.md
- [ ] Database architect assigned and ready
- [ ] Backend lead confirmed ownership
- [ ] Scraper developer scope approved
- [ ] Frontend designer allocated
- [ ] DevOps infrastructure prepared
- [ ] MongoDB cluster provisioned
- [ ] GitHub repository configured
- [ ] CI/CD pipeline ready
- [ ] Monitoring tools configured
- [ ] Slack channels created
- [ ] Wiki updated with quick links
- [ ] First sprint scheduled
- [ ] Kickoff meeting scheduled

---

## NEXT STEPS

**Immediate (This Week):**
1. Review this roadmap with team
2. Assign owners to each phase
3. Create Jira/Azure DevOps tickets
4. Schedule Phase 1 kickoff
5. Provision MongoDB cluster
6. Set up GitHub repository

**By End of Week 1:**
1. Phase 1 development begins
2. Database schema finalized
3. First 10 colleges seeded

---

**Document Owner:** Technical Lead  
**Last Updated:** February 10, 2026  
**Status:** APPROVED - Ready for Execution  
**Estimated Delivery:** April 2026 (12 weeks from start)

