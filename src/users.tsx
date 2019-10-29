import React, { useEffect } from "react";
import { Machine, send, assign, sendParent } from "xstate";
import { useActor, useService } from "@xstate/react";
import * as api from "./api";
import { forwardTo, log } from "xstate/lib/actions";
import { routerService } from "./router-service";

enum Evt {
  GLOBAL_QUERY_UPDATE = "GLOBAL_QUERY_UPDATE",
  GLOBAL_QUERY_SEND = "GLOBAL_QUERY_SEND"
}

export const usersMachine = Machine({
  initial: "init",
  on: {
    [api.Evt.QUERY]: {
      actions: (...qArgs) => console.log({ qArgs })
    },
    [api.Evt.HOME]: {
      actions: [sendParent((_, evt) => evt), log()]
    }
  },
  states: {
    init: {
      on: {
        [Evt.GLOBAL_QUERY_UPDATE]: {
          actions: assign({
            q: (_, { data }: any) => data
          })
        },
        [Evt.GLOBAL_QUERY_SEND]: {
          actions: send(({ q }) => ({ type: api.Evt.QUERY, data: q }))
        }
      }
    }
  }
});

export const Users = ({ aComponentRef }) => {
  const [current, send] = useService(aComponentRef);

  return (
    <div>
      Users!{" "}
      <a
        href="home"
        onClick={evt => {
          evt.preventDefault();
          console.log("Routing...");
          // send(
          //   { type: api.Evt.ON_ROUTE, data: "users/1" } /*, { to: "ROUTER" }*/
          // );
          send({
            type: api.Evt.HOME
          });
        }}
      >
        Home
      </a>
    </div>
  );
};
