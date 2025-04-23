
const getAbsoluteHeightBelowById = (belowId) => {
    const element = belowId ? document.getElementById(belowId) : undefined;
    if (!element) {
        return 0;
    }
    return getElementAbsoluteHeight(element);
};


const getElementAbsoluteHeight = (element) => {
    if (!element) {
        return 0;
    }
    const style = window.getComputedStyle(element);
    const margin = parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    const padding =
        parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    return element.offsetHeight + margin + padding + 1;
};

export const updateMaxHeight = (
    targetClass,
    bottomClass,
    additionalOffset = 0,
    targetProperty = "height",
    belowIds = ["status-bar"]
) => {
    const elements = document.getElementsByClassName(targetClass);
    const belowElements = bottomClass
        ? document.getElementsByClassName(bottomClass)
        : null;

    if (elements.length !== 1 || (belowElements && belowElements.length !== 1)) {
        return;
    }

    const above = elements[0].getBoundingClientRect().top + 1;
    let below = belowElements
        ? belowElements[0].getBoundingClientRect().height + 1
        : 0;

    below += belowIds.reduce((acc, belowId) => {
        return acc + getAbsoluteHeightBelowById(belowId);
    }, 0);

    const offset = Math.ceil(above + below + additionalOffset);
    const style = `${targetProperty}: calc(100vh - ${offset}px)`;

    elements[0].setAttribute("style", style);
};
