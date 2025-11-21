import { writeFile } from "node:fs/promises";
import { Ajv } from "ajv";
import * as TJS from "typescript-json-schema";

/** @type {TJS.PartialArgs} */
const settings = {
  required: true,
};

/** @type {TJS.CompilerOptions} */
const compilerOptions = {
  strictNullChecks: true,
};

const program = TJS.getProgramFromFiles(["lib/types.d.ts"], compilerOptions);

const ajv = new Ajv();

const validators = {
  EventFrontmatter: ajv.compile(
    /** @type {any} */ (
      TJS.generateSchema(program, "EventFrontmatter", settings)
    )
  ),
};

/** @type {(data: unknown) => import("./types.d.ts").EventFrontmatter} */
export const validateEventFrontmatter = (data) => {
  const validator = validators.EventFrontmatter;
  if (validator(data)) return /** @type {any} */ (data);
  throw new Error(`Invalid frontmatter: ${ajv.errorsText(validator.errors)}`, {
    cause: { data },
  });
};
