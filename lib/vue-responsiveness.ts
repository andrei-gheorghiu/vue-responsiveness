import {
  VueResponsivenessBreakpoints,
  VueResponsivenessMatches,
  Presets,
} from "./";
import { ReactiveVariable } from "vue/macros";
import { App, reactive } from "vue";

export const VueResponsiveness = {
  install(
    app: App,
    breakpoints: VueResponsivenessBreakpoints = Presets.Bootstrap_5
  ): App {
    const intervals: Record<string, { min: string; max: string }> =
      Object.entries(breakpoints)
        .sort(([, a], [, b]) => (a || 0) - (b || 0))
        .reduce((out, [key, min], i, arr) => {
          out[key] = {
            min: min ? `(min-width: ${min}px)` : "",
            max: arr[i + 1]?.[1]
              ? `(max-width: ${arr[i + 1]?.[1]! - 0.1}px)`
              : "",
          };
          return out;
        }, {} as Record<string, { min: string; max: string }>);
    const matches: ReactiveVariable<VueResponsivenessMatches> = reactive({
      ...Object.assign(
        {},
        ...Object.keys(intervals).map((_) => ({
          [_]: { min: false, max: false, only: false },
        }))
      ),
    });

    Object.entries(intervals).forEach(([interval, query]) => {
      const queries: Record<"min" | "max", MediaQueryList> = {
        min: window.matchMedia(query.min),
        max: window.matchMedia(query.max),
      };
      Object.entries(queries).forEach(([key, query]) => {
        const listener = ({ matches: val }: { matches: boolean }) => {
          const { min, max } = { ...matches[interval], [key]: val } as {
            min: boolean;
            max: boolean;
          };
          matches[interval] = { min, max, only: min && max };
        };
        query.addEventListener("change", listener);
        listener(query);
      });
    });

    app.config.globalProperties.$matches = matches;

    return app;
  },
};
