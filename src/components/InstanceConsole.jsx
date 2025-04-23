import { useEffect, useRef, useState } from "react";
import { FitAddon } from "xterm-addon-fit";
import { updateMaxHeight } from "../utils/updateMaxHeight";
import Xterm from "../components/Xterm";

const getWsErrorMsg = (code) => {
    const messages = {
        1000: "Normal closure.",
        1001: "Server closed or client navigated away.",
        1002: "Protocol error.",
        1003: "Data type not supported.",
        1004: "Reserved.",
        1005: "No status code present.",
        1006: "Abnormal close.",
        1007: "Invalid data format.",
        1008: "Policy violation.",
        1009: "Message too big.",
        1010: "Missing expected extensions.",
        1011: "Internal server error.",
        1015: "TLS handshake failed.",
    };
    return messages[code] || "Unknown reason";
};

function useEventListener(eventName, handler, element = window) {
    useEffect(() => {
        if (!element) return;
        const eventListener = (event) => handler(event);
        element.addEventListener(eventName, eventListener);
        return () => element.removeEventListener(eventName, eventListener);
    }, [eventName, handler, element]);
}

const InstanceTextConsole = () => {
    const textEncoder = new TextEncoder();
    const [ws, setWs] = useState(null);
    const [fitAddon] = useState(new FitAddon());
    const xtermRef = useRef(null);

    const handleError = (e) => {
        console.error("WebSocket error: ", e);
    };


    const connectToConsole = async () => {

        const operationUrl = ""
        const fd0 = ""
        const controlsec = ""
        const INCUS_HOST = ""

        const dataUrl = `wss://${INCUS_HOST}/operation/${operationUrl}/websocket?secret=${fd0}`;
        const controlUrl = `wss://${INCUS_HOST}/operation/${operationUrl}/websocket?secret=${controlsec}`;

        const data = new WebSocket(dataUrl);
        const control = new WebSocket(controlUrl);

        control.onopen = () => {
            console.log("Control WS opened");
        };

        control.onerror = handleError;

        control.onclose = (event) => {
            if (1005 !== event.code) {
                console.error("Error", event.reason, getWsErrorMsg(event.code));
            }
        };

        data.onopen = () => {
            setDataWs(data);
            setWs(data); // This was missing in your version
        };

        data.onerror = handleError;

        data.onclose = (event) => {
            if (1005 !== event.code) {
                console.error("Error", event.reason, getWsErrorMsg(event.code));
            }
            setDataWs(null);
        };

        data.binaryType = "arraybuffer";
        data.onmessage = (message) => {
            xtermRef.current?.write(new Uint8Array(message.data));
        };

        return [data, control];
    };

    useEffect(() => {
        xtermRef.current?.focus();
    }, []);

    useEffect(() => {
        if (!ws) {
            const socketPromise = connectToConsole();
            return () => {
                socketPromise?.then((websockets) => {
                    websockets?.forEach(ws => ws.close());
                });
            };
        }
    }, [fitAddon]);


    const handleResize = () => {
        updateMaxHeight("p-terminal", undefined, 10);
        xtermRef.current?.element?.style.setProperty("padding", "1rem");
        fitAddon.fit();

        // Optionally send resize event to server
        if (ws && ws.readyState === WebSocket.OPEN && xtermRef.current) {
            const { cols, rows } = xtermRef.current;
            const resizePayload = JSON.stringify({
                type: "resize",
                cols,
                rows,
            });
            ws.send(resizePayload);
        }
    };

    useEventListener("resize", () => {
        handleResize();
        setTimeout(handleResize, 500);
    });

    return (
        <Xterm
            ref={xtermRef}
            addons={[fitAddon]}
            onData={(data) => {
                if (ws?.readyState === WebSocket.OPEN) {
                    ws.send(textEncoder.encode(data));
                } else {
                    console.error("WebSocket is not open. Cannot send data.");
                }
            }}
            className="p-terminal"
            onOpen={handleResize}
        />
    );
};

export default InstanceTextConsole;
