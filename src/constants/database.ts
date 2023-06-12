import localforage from "localforage";

export const userResourceDatabase = localforage.createInstance({
  description: "User Resource cached",
  name: "UserResource",
  storeName: "main",
});

export const localData = localforage.createInstance({
  description: "Confession Manager local datas",
  name: "ConfessionManager",
  storeName: "main",
});