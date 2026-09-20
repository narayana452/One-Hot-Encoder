// ==========================================================
// GLOBAL DATA
// ==========================================================

let processedRows = [];


// ==========================================================
// UPLOAD DATASET
// ==========================================================

async function uploadDataset() {

    const fileInput =
        document.getElementById("csvFile");

    const message =
        document.getElementById("uploadMessage");


    if (!fileInput.files.length) {

        showMessage(
            "Please select a CSV file.",
            false
        );

        return;
    }


    const file =
        fileInput.files[0];


    if (
        !file.name
            .toLowerCase()
            .endsWith(".csv")
    ) {

        showMessage(
            "Please upload a CSV file.",
            false
        );

        return;
    }


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    showMessage(
        "Processing CSV file...",
        true
    );


    try {

        const response =
            await fetch(
                "/upload",
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            showMessage(
                data.message,
                false
            );

            return;
        }


        processedRows =
            data.rows;


        showMessage(
            "File processed successfully.",
            true
        );


        displaySummary(data);

        displayMappings(data);

        displayDataset(data);


    }

    catch (error) {

        showMessage(
            "Server connection failed.",
            false
        );

        console.error(error);

    }

}


// ==========================================================
// SUMMARY
// ==========================================================

function displaySummary(data) {

    const card =
        document.getElementById(
            "summaryCard"
        );


    const summary =
        document.getElementById(
            "summary"
        );


    card.classList.remove(
        "hidden"
    );


    summary.innerHTML = `

        <span>
            File:
            ${escapeHtml(data.filename)}
        </span>

        <span>
            Rows:
            ${data.row_count}
        </span>

        <span>
            Total Columns:
            ${data.original_columns.length}
        </span>

        <span>
            Categorical Columns:
            ${data.categorical_columns.length}
        </span>

        <span>
            Numeric Columns:
            ${data.numeric_columns.length}
        </span>

    `;
}


// ==========================================================
// DISPLAY CATEGORY MAPPINGS
// ==========================================================

function displayMappings(data) {

    const card =
        document.getElementById(
            "mappingCard"
        );


    const container =
        document.getElementById(
            "mappingContainer"
        );


    card.classList.remove(
        "hidden"
    );


    let html = "";


    if (
        data.categorical_columns.length === 0
    ) {

        html = `

            <div class="message">

                No categorical columns detected.

            </div>

        `;

        container.innerHTML = html;

        return;
    }


    data.categorical_columns.forEach(
        column => {

            const columnData =
                data.column_mappings[column];


            html += `

                <div class="mapping-section">

                    <h3>
                        ${escapeHtml(column)}
                    </h3>

                    <div class="mapping-info">

                        <span>
                            Categories:
                            ${columnData.category_count}
                        </span>

                        <span>
                            Bits:
                            ${columnData.bits_required}
                        </span>

                    </div>

                    <div class="table-container">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Binary Code
                                    </th>

                                    <th>
                                        One-Hot Vector
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

            `;


            for (
                const category
                in columnData.mapping
            ) {

                const item =
                    columnData.mapping[
                        category
                    ];


                html += `

                    <tr>

                        <td>
                            ${escapeHtml(category)}
                        </td>

                        <td>
                            ${item.binary_code}
                        </td>

                        <td>
                            [${item.one_hot.join(", ")}]
                        </td>

                    </tr>

                `;

            }


            html += `

                            </tbody>

                        </table>

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML = html;
}


// ==========================================================
// DISPLAY COMPLETE DATASET
// ==========================================================

function displayDataset(data) {

    const card =
        document.getElementById(
            "datasetCard"
        );


    const container =
        document.getElementById(
            "datasetResult"
        );


    card.classList.remove(
        "hidden"
    );


    if (!data.rows.length) {

        container.innerHTML =
            "<p>No data available.</p>";

        return;
    }


    const columns =
        Object.keys(
            data.rows[0]
        );


    let html = `

        <table>

            <thead>

                <tr>

    `;


    columns.forEach(
        column => {

            html += `

                <th>
                    ${escapeHtml(column)}
                </th>

            `;

        }
    );


    html += `

                </tr>

            </thead>

            <tbody>

    `;


    data.rows.forEach(
        row => {

            html += "<tr>";


            columns.forEach(
                column => {

                    html += `

                        <td>
                            ${escapeHtml(
                                String(
                                    row[column] ?? ""
                                )
                            )}
                        </td>

                    `;

                }
            );


            html += "</tr>";

        }
    );


    html += `

            </tbody>

        </table>

    `;


    container.innerHTML = html;
}


// ==========================================================
// DOWNLOAD
// ==========================================================

async function downloadEncodedDataset() {

    if (!processedRows.length) {

        alert(
            "Please upload and process a CSV first."
        );

        return;
    }


    try {

        const response =
            await fetch(
                "/download",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        rows: processedRows
                    })

                }
            );


        if (!response.ok) {

            alert(
                "Unable to download file."
            );

            return;
        }


        const blob =
            await response.blob();


        const url =
            window.URL.createObjectURL(
                blob
            );


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            "encoded_dataset.csv";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        window.URL.revokeObjectURL(
            url
        );

    }

    catch (error) {

        alert(
            "Download failed."
        );

    }

}


// ==========================================================
// NORMAL TESTS
// ==========================================================

async function runNormalTests() {

    try {

        const response =
            await fetch(
                "/tests"
            );


        const data =
            await response.json();


        let html = `

            <h3>
                Normal Test Cases
            </h3>

            <p>
                Passed:
                <strong>
                    ${data.passed}
                    /
                    ${data.total}
                </strong>
            </p>

            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>
                                Test
                            </th>

                            <th>
                                Category
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>

                    </thead>

                    <tbody>

        `;


        data.results.forEach(
            result => {

                html += `

                    <tr>

                        <td>
                            ${result.test}
                        </td>

                        <td>
                            ${escapeHtml(
                                result.category
                            )}
                        </td>

                        <td class="pass">
                            ${result.status}
                        </td>

                    </tr>

                `;

            }
        );


        html += `

                    </tbody>

                </table>

            </div>

        `;


        showTestResult(html);

    }

    catch (error) {

        alert(
            "Unable to run tests."
        );

    }

}


// ==========================================================
// EDGE TESTS
// ==========================================================

async function runEdgeTests() {

    try {

        const response =
            await fetch(
                "/edge-tests"
            );


        const data =
            await response.json();


        let html = `

            <h3>
                Edge / Fault Tests
            </h3>

            <p>
                Passed:
                <strong>
                    ${data.passed}
                    /
                    ${data.total}
                </strong>
            </p>

            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>
                                Test
                            </th>

                            <th>
                                Case
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>

                    </thead>

                    <tbody>

        `;


        data.results.forEach(
            result => {

                html += `

                    <tr>

                        <td>
                            ${result.test}
                        </td>

                        <td>
                            ${escapeHtml(
                                result.case
                            )}
                        </td>

                        <td class="pass">
                            ${result.status}
                        </td>

                    </tr>

                `;

            }
        );


        html += `

                    </tbody>

                </table>

            </div>

        `;


        showTestResult(html);

    }

    catch (error) {

        alert(
            "Unable to run edge tests."
        );

    }

}


// ==========================================================
// VALIDATION
// ==========================================================

async function showValidation() {

    try {

        const response =
            await fetch(
                "/validation"
            );


        const data =
            await response.json();


        const html = `

            <h3>
                Validation Report
            </h3>

            <div class="status-box">

                <span>
                    CSV Upload:
                    ${data.csv_upload}
                </span>

                <span>
                    Column Detection:
                    ${data.dynamic_column_detection}
                </span>

                <span>
                    Category Detection:
                    ${data.dynamic_category_detection}
                </span>

                <span>
                    Binary Generation:
                    ${data.binary_generation}
                </span>

                <span>
                    One-Hot:
                    ${data.one_hot_generation}
                </span>

                <span>
                    Normal Tests:
                    ${data.normal_tests}
                </span>

                <span>
                    Edge Tests:
                    ${data.edge_tests}
                </span>

            </div>

            <div class="overall-status">

                ${data.overall_status}

            </div>

        `;


        showTestResult(html);

    }

    catch (error) {

        alert(
            "Unable to load validation report."
        );

    }

}


// ==========================================================
// SHOW TEST RESULT
// ==========================================================

function showTestResult(html) {

    const container =
        document.getElementById(
            "testResult"
        );


    container.innerHTML = html;


    container.classList.remove(
        "hidden"
    );

}


// ==========================================================
// MESSAGE
// ==========================================================

function showMessage(
    text,
    success
) {

    const element =
        document.getElementById(
            "uploadMessage"
        );


    element.textContent = text;


    element.classList.remove(
        "hidden"
    );


    if (success) {

        element.className =
            "message success";

    } else {

        element.className =
            "message error";

    }

}


// ==========================================================
// HTML ESCAPE
// ==========================================================

function escapeHtml(value) {

    return value
        .replace(/&/g, "&amp;")
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}