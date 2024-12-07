import { assertEquals } from "@std/assert";
import { decodeBase32 } from "./encoding.ts";

Deno.test("decodeBase32", async (t) => {
  await t.step("decodes uppercase with padding", () => {
    assertEquals(decodeBase32("MZXW6==="), new TextEncoder().encode("foo"));
  });

  await t.step("decodes uppercase without padding", () => {
    assertEquals(decodeBase32("MZXW6"), new TextEncoder().encode("foo"));
  });

  await t.step("decodes lowercase with padding", () => {
    assertEquals(decodeBase32("mzxw6==="), new TextEncoder().encode("foo"));
  });

  await t.step("decodes lowercase without padding", () => {
    assertEquals(decodeBase32("mzxw6"), new TextEncoder().encode("foo"));
  });
});
