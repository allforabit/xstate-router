import * as React from "react";
import { render } from "react-dom";
import { Machine, assign, spawn, send } from "xstate";
import { log } from "xstate/lib/actions";
import { useMachine } from "@xstate/react";
import "./styles.css";
import { homeMachine, Home } from "./home";
import { NotFound } from "./not-found";
import * as api from "./api";
import { routerService } from "./router-service";
import { HTMLRouter, EVENT_ROUTE_CHANGED } from "@thi.ng/router";
import { Users, usersMachine } from "./users";
import { mergeDeepObj } from "@thi.ng/associative";
import { getIn } from "@thi.ng/paths";
import { ThemeProvider } from "emotion-theming";
import { theme } from "./theme";
import { Box, Button } from "rebass";

const createToggleMachine = (overRides = {}) => {
  return Machine(
    mergeDeepObj(
      {
        id: "toggle",
        initial: "disabled",
        states: {
          enabled: {
            meta: { title: "Enabled" },
            on: {
              TOGGLE: "disabled"
            }
          },
          disabled: {
            meta: { title: "Disabled" },
            on: {
              TOGGLE: "enabled"
            }
          }
        }
      },
      overRides
    )
  );
};

const Toggler = () => {
  const [current, send] = useMachine(
    createToggleMachine({
      id: "myToggle",
      states: {
        enabled: {
          meta: { title: "Yo" }
        }
      }
    })
  );

  return (
    <Box>
      <Box>
        State: {getIn(current, ["meta", `myToggle.${current.value}`, "title"])}
      </Box>
      <div>
        {current.matches("enabled") ? (
          <Button onClick={() => send("TOGGLE")}>Disable</Button>
        ) : (
          <Button onClick={() => send("TOGGLE")}>Enable</Button>
        )}
      </div>
    </Box>
  );
};

// router configuration
const routerConfig = {
  // use hash fragment for routes
  useFragment: false,

  // fallback route (when no other matches)
  defaultRouteID: "home",

  // optional enforced route when router starts

  // Optional route path component separator. Default: `/`
  separator: "/",

  // actual route defs
  // these are checked in given order
  // IMPORTANT: rules with common prefixes MUST be specified in
  // order of highest precision / longest path
  routes: [
    {
      // each route MUST have an ID
      id: "home",
      // optional title for UI purposes (no internal function)
      title: "Home page",
      // this array defines the route path items
      match: ["home"]
    },
    {
      id: "users",
      // this rule is parametric
      // variable items are prefixed with `?`
      match: ["users", "?id"],
      // coercion & validation handlers for "?id" param
      // coercion fn is applied BEFORE validator
      validate: {
        id: {
          coerce: x => parseInt(x, 10)
          // check: x => x > 0 && x < 100
        }
      }
    }
  ]
};

enum Evt {
  ROUTE = "ROUTE"
}

export const appMachine = Machine(
  {
    initial: "init",
    context: {
      currentPage: null,
      routerConfig
    },
    invoke: [
      {
        id: "router",
        src: "router"
      }
    ],
    on: {
      [api.Evt.HOME]: {
        target: "home"
      },
      [api.Evt.USERS]: {
        target: "users"
      },
      ROUTE_CHANGE: {
        actions: (...rcArgs) => {
          console.log({ rcArgs });
        }
      }
    },
    states: {
      // Top level sections
      init: {
        on: {
          // Handle the initial route information
          ROUTE_EXTERNAL: [
            {
              cond: (_, { id }) => id === "users",
              actions: send((_, evt) => ({ ...evt, type: api.Evt.USERS }))
            },
            {
              cond: (_, { id }) => id === "home",
              actions: send((_, evt) => ({ ...evt, type: api.Evt.HOME }))
            }
          ]
        }
      },
      home: {
        entry: [
          assign({ currentPage: () => spawn(homeMachine, "home") }),
          send(
            (_, evt) => ({
              type: "ROUTE",
              id: "home"
            }),
            { to: "router" }
          )
        ]
      },
      users: {
        entry: [
          assign({ currentPage: () => spawn(usersMachine, "users") }),
          send(
            (_, evt) => ({
              type: "ROUTE",
              id: "users",
              params: evt.params
            }),
            { to: "router" }
          )
        ]
      }
    }
  },
  {
    services: {
      router: routerService
    }
  }
);

const App = () => {
  const [current] = useMachine(appMachine);
  const { context } = current;

  console.log(context.currentPage);

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Toggler />
        <Box>
          {{
            home: <Home aComponentRef={context.currentPage} />,
            users: <Users aComponentRef={context.currentPage} />
          }[current.value] || <NotFound />}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

const rootElement = document.getElementById("root");
render(<App />, rootElement);
