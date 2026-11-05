# SnapSave V2 — 10-day development checklist

**Window:** 3–12 November 2026. **Development deadline:** 12 November 2026. Keep `main` as the V1 release until V2 passes the release gates. Local feature-branch commits are authorized for Day 2; do not merge, push, publish PRs, or touch production data without approval.

| Day | Date | Checklist and exit condition |
| --- | --- | --- |
| 1 | Nov 3 | [ ] Preserve both dirty checkouts; record branch heads, untracked files, and test results. Agree on V2 scope and release acceptance criteria. |
| 2 | Nov 4 | [ ] Add focused import tests for same-file repeats, reupload, concurrent uploads, legacy records, missing identifiers, invalid PDFs, and partial writes. Resolve the index and response semantics in the import patch. |
| 3 | Nov 5 | [ ] Verify import behavior with an isolated test database and synthetic statements. Confirm zero new rows on an identified reupload and accurate saved/duplicate/error counts. |
| 4 | Nov 6 | [ ] Fix auth initialization for stored token plus cached user, stale token, and backend timeout. Add a focused route/session regression check. |
| 5 | Nov 7 | [ ] Reconcile demo upload UI with import API responses; show duplicate and partial results honestly. Run upload-to-dashboard flow against a demo-only database. |
| 6 | Nov 8 | [ ] Implement the highest-priority V2 feature agreed on Day 1 and its focused tests. The PRD's chatbot, reminders, and mobile app have no implementation in these checkouts, so record which are in this release. |
| 7 | Nov 9 | [ ] After explicit integration approval, integrate reviewed fixes into `develop` in order. Resolve actual conflicts and run backend tests, frontend lint, and build after each integration. |
| 8 | Nov 10 | [ ] Exercise registration, login, refresh, upload, repeat upload, dashboard, insights, and goals with fictional data. Check failure messages and browser/server logs. |
| 9 | Nov 11 | [ ] Run release regression on Node 20.x, verify database index and backup/rollback procedure, update README/demo guide, and freeze features. |
| 10 | Nov 12 | [ ] Close critical defects; repeat all gates and obtain release approval before promotion to `main` or a push. Record the final commit IDs and known limitations. |

**Integration order after approval:** (1) preserve the uncommitted demo and import work as reviewable patches/commits on their own branches; (2) finish and test import reliability; (3) fix and test auth loading; (4) integrate the demo upload feedback and fixture; (5) validate the combined `develop` branch. The import and demo patches currently touch different files, but their combined behavior has not been tested.

**Release gates:** all backend tests pass with the required Jest configuration; frontend lint and production build pass; Node 20.x is verified; import counts and idempotency pass against an isolated database; authenticated end-to-end flow passes; no critical defects remain. Use no production data for verification.
