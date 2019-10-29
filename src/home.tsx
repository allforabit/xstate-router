import React, { useEffect } from "react";
import { Machine, send, assign, sendParent } from "xstate";
import { useActor, useService } from "@xstate/react";
import * as api from "./api";
import { forwardTo, log } from "xstate/lib/actions";

enum Evt {
  GLOBAL_QUERY_UPDATE = "GLOBAL_QUERY_UPDATE",
  GLOBAL_QUERY_SEND = "GLOBAL_QUERY_SEND"
}

export const homeMachine = Machine({
  initial: "init",
  context: {
    q: ""
  },
  entry: () => {
    console.log("entry");
  },
  on: {
    [api.Evt.QUERY]: {
      actions: (...qArgs) => console.log({ qArgs })
    },
    [api.Evt.USERS]: {
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

export const Home = ({ aComponentRef }) => {
  const [current, send] = useService(aComponentRef);
  // const { context } = current;
  useEffect(() => {
    aComponentRef.send({ type: api.Evt.QUERY, data: "bla" });
  }, []);

  return (
    <div>
      Hello world yo!{" "}
      <a
        href="users/1"
        onClick={evt => {
          evt.preventDefault();
          console.log("Routing...");
          // send(
          //   { type: api.Evt.ON_ROUTE, data: "users/1" } /*, { to: "ROUTER" }*/
          // );
          send(
            {
              type: api.Evt.USERS,
              id: "users",
              params: { id: 1 }
            } /*, { to: "ROUTER" }*/
          );
        }}
      >
        Users
      </a>
    </div>
  );
  // const { q } = context;

  // return (
  //   <div>
  //     <input
  //       type="text"
  //       value={q}
  //       onChange={evt =>
  //         send({ type: Evt.GLOBAL_QUERY, data: evt.target.value })
  //       }
  //     />
  //     <button
  //       onClick={evt => {
  //         evt.preventDefault();
  //         send({ type: Evt.GLOBAL_QUERY });
  //       }}
  //     />
  //   </div>
  // );
};
