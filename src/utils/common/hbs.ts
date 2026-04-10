import Handlebars from "handlebars";
import { BASE_CSS, DARK_THEME, LIGHT_THEME } from "../../utils/common/constants/theme.js";
import type { ThemeType } from "../../types/theme.js";
import loadTemplate from "./load-template.js";
import getCurrentDate from "./get-current-date.js";
import type { TemplateDependencyType, VulnerabilitiesCountType } from "../../types/template.js";

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

export default function compileTemplate({ theme, counts, dependencies }: Props) {
  const date = getCurrentDate();
  const template = loadTemplate();
  // Compile the template
  const hbsTemplate = Handlebars.compile(template);

  const html = hbsTemplate({
    counts,
    theme,
    dependencies,
    date,
    baseCss: BASE_CSS,
    themeCss: theme === "light" ? LIGHT_THEME : DARK_THEME,
  });

  return html;
}

type Props = {
  counts: VulnerabilitiesCountType;
  theme: ThemeType;
  dependencies: TemplateDependencyType[];
};
