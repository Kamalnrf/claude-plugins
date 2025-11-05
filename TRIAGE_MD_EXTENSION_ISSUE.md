# Triage Report: `.md` Extension in Skills URLs

**Issue**: Skills page URLs may be accidentally including `.md` extension in the path

**Date**: 2025-11-05

## Investigation Summary

I've conducted a thorough investigation of the codebase to identify where `.md` extensions might be appended to skills page URLs.

## Key Findings

### ✅ Frontend Code is Clean

The frontend code **does NOT** append `.md` to skill paths. All URL construction uses the `skill.namespace` field as-is:

1. **SkillCard.tsx** (line 31)
   - Creates links: `/skills/${skill.namespace}`
   - No `.md` appended

2. **sitemap.xml.ts** (line 34)
   - Generates URLs: `${siteUrl}/skills/${skill.namespace}`
   - No `.md` appended

3. **[...slug].astro** (routing handler)
   - Receives slug parameter and splits it into `[owner, marketplace, skillName]`
   - No `.md` appended during processing

4. **OG Image Generation** (`api/og/skills/[...slug].png.ts`)
   - Uses slug parameter directly
   - No `.md` appended

5. **Download API** (`api/download.ts`)
   - Parses namespace from query parameter
   - No `.md` appended

### 🔍 Root Cause: Backend API Data

The issue is **upstream** in the data pipeline. The frontend correctly uses `skill.namespace`, but if the backend API (`https://api.claude-plugins.dev`) returns skill objects where the `namespace` field already includes `.md`, then:

- URLs would become: `/skills/owner/marketplace/skill-name.md`
- Sitemap entries would include `.md` in URLs
- OG image URLs would have `.md` in the path

### Example Data Flow

```typescript
// Backend API returns (INCORRECT):
{
  namespace: "anthropics/claude-plugins/example-skill.md"  // ❌ Has .md
}

// Frontend creates URL:
const url = `/skills/${skill.namespace}`
// Result: /skills/anthropics/claude-plugins/example-skill.md
```

**Expected:**
```typescript
// Backend API should return (CORRECT):
{
  namespace: "anthropics/claude-plugins/example-skill"  // ✅ No .md
}

// Frontend creates URL:
const url = `/skills/${skill.namespace}`
// Result: /skills/anthropics/claude-plugins/example-skill
```

## Code References

### Places Where `skill.namespace` is Used

1. **SkillCard Component** (`packages/web/src/components/SkillCard.tsx:31`)
   ```tsx
   <a href={`/skills/${skill.namespace}`} className="block">
   ```

2. **Sitemap Generation** (`packages/web/src/pages/sitemap.xml.ts:34`)
   ```typescript
   loc: `${siteUrl}/skills/${skill.namespace}`
   ```

3. **Install Command** (`packages/web/src/components/InstallSkill.tsx:23`)
   ```typescript
   const downloadUrl = `/api/download?namespace=${encodeURIComponent(skill.namespace)}`;
   ```

4. **Download API** (`packages/web/src/pages/api/download.ts:15-23`)
   ```typescript
   const namespace = url.searchParams.get("namespace");
   const [owner, marketplace, skillName] = namespace.split("/");
   ```

### Skill Namespace Format

According to the TypeScript interfaces:

```typescript
// packages/web/src/lib/api.ts:55
export interface Skill {
  namespace: string; // "owner/marketplace/skillName"  // ← Should NOT include .md
  // ...
}
```

## Recommendations

### 1. **Verify Backend API Data** (CRITICAL)

Check the registry API (`https://api.claude-plugins.dev/api/skills/{owner}/{marketplace}/{skillName}`) to see if it's returning namespaces with `.md` extensions.

Example API call to test:
```bash
curl https://api.claude-plugins.dev/api/skills/search?limit=5
```

Look at the `namespace` field in the response.

### 2. **Add Data Sanitization** (SHORT-TERM FIX)

If the backend is returning `.md` in namespaces, add sanitization in the frontend:

**In `packages/web/src/lib/api.ts`**, modify the API methods:

```typescript
async getSkill(
  owner: string,
  marketplace: string,
  skillName: string,
): Promise<Skill> {
  // Remove .md extension if present
  const sanitizedSkillName = skillName.replace(/\.md$/i, '');

  return this.fetchWithCache(
    `skill:${owner}/${marketplace}/${sanitizedSkillName}`,
    async () => {
      const url = `${REGISTRY_BASE}/api/skills/${owner}/${marketplace}/${sanitizedSkillName}`;
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Skill not found: ${response.status}`);
      }

      const data = await response.json();
      // Sanitize namespace in response
      if (data.namespace) {
        data.namespace = data.namespace.replace(/\.md$/i, '');
      }
      return data;
    },
  );
}
```

### 3. **Fix Backend Data** (LONG-TERM FIX)

The proper fix is to ensure the backend registry stores skill names **without** the `.md` extension. Skills should be identified by their logical name, not their filename.

### 4. **Add Validation Tests**

Add tests to ensure skill namespaces don't contain file extensions:

```typescript
test('skill namespace should not contain file extensions', async () => {
  const skills = await registryAPI.searchSkills({ limit: 100 });
  skills.skills.forEach(skill => {
    expect(skill.namespace).not.toMatch(/\.md$/i);
  });
});
```

## Next Steps

1. ✅ **Investigate backend API responses** - Check actual data being returned
2. ⏳ **Identify source of `.md` in data** - Find where skill names are being stored with extensions
3. ⏳ **Implement fix** - Either sanitize in frontend or fix backend data
4. ⏳ **Add validation** - Prevent regression with tests

## Notes

- The `.md` reference in `[...slug].astro:59` is just display text "SKILL.md" for the section header, not part of any URL
- The CLI's `extractSkillName()` function takes the last part of the identifier as-is, so if given `owner/repo/skill.md`, it would extract `skill.md`
- No evidence of `.md` being programmatically appended in the frontend code

## Conclusion

The frontend code is **not appending** `.md` to paths. If `.md` is appearing in URLs, it's because the data from the backend API already includes it in the `namespace` field. The fix should focus on:

1. Verifying the backend data source
2. Cleaning up existing data
3. Adding validation to prevent `.md` in skill identifiers
