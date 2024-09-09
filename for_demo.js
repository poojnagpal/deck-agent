function writeToMultipleTextboxes(fields) {
    fields.forEach(field => {
        var element = document.evaluate(field.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        // Check if the element exists and is a textbox
        if (element && element.tagName === 'INPUT' && element.type === 'text') {
            element.value = field.text;  // Set the value of the textbox
        } else {
            console.error(`Element not found or not a valid textbox for XPath: ${field.xpath}`);
        }
    });
}
const fieldsToFill = [
    { xpath: "/html/body/div[2]/form/div/div[1]/div[1]/div[2]/input", text: "ms" },
    { xpath: "/html/body/div[2]/form/div/div[1]/div[2]/div[2]/input", text: "pooja" },
    { xpath: "/html/body/div[2]/form/div/div[1]/div[4]/div[2]/input", text: "nagpal" },
    { xpath: "/html/body/div[2]/form/div/div[1]/div[6]/div[2]/input", text: "dcg" },
    { xpath: "/html/body/div[2]/form/div/div[1]/div[8]/div[2]/input", text: "nyc" }
    ];
writeToMultipleTextboxes(fieldsToFill);