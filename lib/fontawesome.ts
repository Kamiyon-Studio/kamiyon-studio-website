/**
 * Font Awesome setup for Next.js — disable auto CSS injection and load
 * styles once so SSR and client stay in sync.
 * @see https://docs.fontawesome.com/web/use-with/react/use-with#next-js
 */
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;
