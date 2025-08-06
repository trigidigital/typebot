import { registerWebComponents } from "./register";
import { injectTrigiDigitalInWindow, parseTrigiDigital } from "./window";

registerWebComponents();

const trigidigital = parseTrigiDigital();

injectTrigiDigitalInWindow(trigidigital);

export default trigidigital;
