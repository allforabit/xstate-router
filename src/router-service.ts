import { HTMLRouter, EVENT_ROUTE_CHANGED } from "@thi.ng/router";

export enum Evt {
  ROUTE = "ROUTE",
  ROUTE_EXTERNAL = "ROUTE_EXTERNAL"
}

export const routerService = ({ routerConfig }) => (cb, onEvent) => {
  // console.log({ routerConfig });
  const router = new HTMLRouter(routerConfig);

  router.addListener(EVENT_ROUTE_CHANGED, ({ value }) => {
    cb({
      type: Evt.ROUTE_EXTERNAL,
      ...value
    });
  });

  router.start();

  // console.log({ router });
  onEvent(evt => {
    if (evt.type === "ROUTE") {
      router.route(
        evt.params ? router.format(evt.id, evt.params) : router.format(evt.id)
      );
    }
  });
};
