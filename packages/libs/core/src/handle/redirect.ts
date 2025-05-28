import { setHeadersFromRoute } from "./headers";
import { Event, RedirectRoute } from "../types";

export const redirect = (event: Event, route: RedirectRoute) => {
  setHeadersFromRoute(event, route);
  event.res.statusCode = route.status;
  event.res.statusMessage = route.statusDescription;
  event.res.end();
};

export const redirectByPageProps = (event: Event, route: RedirectRoute) => {
  event.res.setHeader(
    "cache-control",
    route.headers?.cacheControl?.join(":") ?? ""
  );
  event.res.setHeader("Location", route.headers?.location[0].value ?? "");
  event.res.statusCode = route.status;
  event.res.end();
};
