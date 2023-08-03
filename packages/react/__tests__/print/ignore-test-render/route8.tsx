// @ts-nocheck
/* sagaroute-inject:imports */
/* injected by sagaroute: start */
import {action1,action2,default as defaultAction} from "@/utils/action.ts";
import * as loader from "@/utils/loader.ts";
import {loader3} from "@/utils/loader.ts";
import PagesUsers from "@/pages/users.tsx";
import PagesDashboard from "@/pages/dashboard.tsx";
import PagesChart,{Error as PagesChartError} from "@/pages/chart.tsx";
/* injected by sagaroute: end */

import React from "react";

// sagaroute-inject: routes
export default [
  {
    "path": "users",
    "element": <PagesUsers/>,
    "action": action1,
    "loader1": loader.loader1
  },
  {
    "path": "dashboard",
    "Component": <PagesDashboard/>,
    "action": action2,
    "loader1": loader.loader2
  },
  {
    "path": "chart",
    "Component": <PagesChart/>,
    "action": defaultAction,
    "loader1": loader3,
    "errorElement": <PagesChartError/>
  }
];