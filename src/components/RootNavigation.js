import React from "react";

export const navigationRef = React.createRef();
export const isReadyRef = React.createRef(); 

const navigate = (name, params) =>
    navigationRef.current?.navigate(name, params);

export default {
    navigate,
};