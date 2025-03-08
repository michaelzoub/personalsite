import { atom } from "jotai";
import { musicInf } from "../types/musicInfo";

export const musicInfo = atom<null | musicInf>(null);