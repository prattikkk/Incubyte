# Test Report

Date: 2025-09-19

Summary:
- Suite: Maven Surefire + Spring Boot Test (JUnit 5)
- Status: PASS
- Notable integration suite: `com.example.sweet_shop.controller.SweetControllerSecurityTest`

Details:

## Unit/Integration Summary

- com.example.sweet_shop.controller.SweetControllerSecurityTest
  - Tests run: 6
  - Failures: 0
  - Errors: 0
  - Skipped: 0
  - Profile: test (H2 + Flyway)

## Coverage (JaCoCo)
- JaCoCo report generated at `target/site/jacoco/index.html` and `target/site/jacoco/jacoco.csv`.
- Per-class coverage thresholds enforced (line >= 70%, branch >= 50%), excluding entrypoint.
- Verify phase passed with coverage rules satisfied.

## How to reproduce

```powershell
# Run tests and coverage
./mvnw verify

# View summary in surefire reports
Get-Content -Path target/surefire-reports/com.example.sweet_shop.controller.SweetControllerSecurityTest.txt

# Optional: open HTML coverage
# (on Windows, replace with file URI in a browser or open from VS Code)
```

## Selected surefire output
```
-------------------------------------------------------------------------------
Test set: com.example.sweet_shop.controller.SweetControllerSecurityTest
-------------------------------------------------------------------------------
Tests run: 6, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: ~11 s -- in com.example.sweet_shop.controller.SweetControllerSecurityTest
```

## E2E Smoke
- Script: `scripts/e2e-smoke.ps1`
- Status: PASS (register, login, list, create, update, purchase, invalid purchase, restock permissions, delete, 404 on deleted get)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\e2e-smoke.ps1
```
