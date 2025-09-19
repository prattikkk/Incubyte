## Next TDD Steps (Backend)

1. SweetService tests (write failing first):
   - createSweet_success (unique name, positive price, quantity >=0)
   - createSweet_duplicateName (expect IllegalArgumentException)
   - updateSweet_changePriceAndQuantity_success
   - purchaseSweet_decrementsQuantity_andPreventsNegative (edge: exactly remaining stock)
   - restockSweet_incrementsQuantity (admin only - will add role check after JWT implemented)
   - searchSweet_byNamePartial / byCategory / byPriceRange

2. Implement SweetService with Specifications for search.

3. Add controllers: AuthController, SweetController (write MVC slice tests with MockMvc for validation + security once JWT added).

4. JWT Implementation TDD:
   - TokenProvider tests (generate, parse, expiration)
   - Authentication filter integration test (MockMvc) for protected endpoints.

### JWT Detailed TDD Cycle
1. Create `JwtProperties` @ConfigurationProperties bound to `app.security.jwt.*` (add to enable config binding) + validation (length of secret >= 32 bytes for HS256).
2. Red: Write `JwtTokenProviderTest` expecting:
   - generateToken returns non-empty string.
   - parseUsernameFromToken returns original subject.
   - expired token throws / returns empty.
3. Green: Implement `JwtTokenProvider` using jjwt.
4. Red: Write `JwtAuthenticationFilterTest` (MockMvc slice) hitting a dummy protected endpoint expecting 401 without token, 200 with valid token.
5. Green: Implement filter + adapt `SecurityConfig` to require auth for `/api/sweets/**` except GET list & search.
6. Add role-based method security (enable @EnableMethodSecurity) for admin operations (delete, restock) + tests using a token with ROLE_ADMIN claim.
7. Refactor: Extract common test token builder, ensure token expiration configurable.

5. Security tighten: restrict /api/sweets/** to authenticated, admin constraints on delete & restock.

## Frontend Steps
1. Scaffold React app (Vite) in /frontend.
2. Implement API client with token storage (localStorage) and refresh logic (if refresh tokens added) - otherwise simple expiry handling.
3. Pages: Login, Register, SweetsList (search + purchase), AdminDashboard (CRUD + restock/delete).
4. Component tests with React Testing Library for key flows.

## Quality & Docs
1. Add README with setup, My AI Usage section.
2. Add test coverage reporting (Jacoco) in Maven.
3. GitHub Actions workflow for CI (build + test + coverage badge).
