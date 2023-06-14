const express = require("express");
const user = express.Router();
const bcrypt = require("bcryptjs");
const db = require("./dbconnector");
const PDFDocument = require("pdfkit");
const fs = require("fs");

user.use(express.json());

user.get("/test", async(request, response) => {
    db.query("select * from users", async(err, result) => {
        if (err) {
            response.send(err);
        } else {
            response.send(result);
        }
    });
});

user.post("/login", async(request, response) => {
    const { username, password } = request.body;

    db.query(
        "select * from users where BINARY username=?",
        username,
        async(err, result) => {
            try {
                if (!result[0]) {
                    response.status(401).send({ message: "Invalid Username !!" });
                } else {
                    const isPasswordValid = await bcrypt.compare(
                        password,
                        result[0].password
                    );
                    if (!isPasswordValid) {
                        response.status(401).send({ message: "Invalid Password" });
                    } else {
                        response.send("success");
                    }
                }
            } catch (err) {
                response.status(500).send({ message: "Error Logging in !!", err });
            }
        }
    );
});

user.post("/register", async(request, response) => {
    let details = request.body;

    db.query(
        "select * from users where BINARY username=?",
        details.username,
        async(err, result) => {
            if (err) {
                response
                    .status(500)
                    .send({ message: "Something went wrong, Please try again !!", err });
            }
            if (result[0]) {
                response.status(401).send("User already exists !!");
            } else {
                let password = await bcrypt.hash(details.password, 6);
                details.password = password;
                db.query("insert into users SET ?", details, (err, result) => {
                    if (err) {
                        response.status(500).send({
                            message: "Something went wrong, Please try again !!",
                            err,
                        });
                    } else {
                        response.send("Registered successfully !!");
                    }
                });
            }
        }
    );
});

user.get("/pdfreport", async(req, res) => {
    db.query("select * from users", (err, result) => {
        if (err) {
            console.log(err);
            res.status(404).send(err);
        } else {
            try {
                const doc = new PDFDocument();

                // Set response headers
                res.setHeader("Content-Disposition", 'attachment; filename="data.pdf"');
                res.setHeader("Content-Type", "application/pdf");

                // Add main heading
                doc
                    .font("Helvetica-Bold")
                    .fontSize(18)
                    .text("User Data Report", {
                        align: "center",
                        underline: true,
                    })
                    .moveDown();

                // Pipe the PDF document to the response
                doc.pipe(res);

                // Set table properties
                const table = {
                    headers: ["ID", "Name", "Email"],
                    rows: result.map((row) => [row.id, row.username, row.email]),
                };
                const tableWidth = 400;
                const cellPadding = 10;
                const headerHeight = 20;
                const rowHeight = 30;

                // Set initial position
                let y = doc.y + 30;

                // Draw table headers
                doc.font("Helvetica-Bold").fontSize(12);
                doc
                    .rect(100, y, tableWidth, headerHeight)
                    .fillAndStroke("#CCCCCC", "#000000");
                doc.fillColor("#000000");

                // Draw header text
                table.headers.forEach((header, index) => {
                    const headerX = 60 + index * (tableWidth / table.headers.length);
                    doc.text(header, headerX, y + 6, {
                        width: tableWidth / table.headers.length,
                        align: "center",
                        valign: "center",
                    });
                });

                // Move to the next row
                y += headerHeight;

                // Draw table rows
                doc.font("Helvetica").fontSize(12);
                table.rows.forEach((row, rowIndex) => {
                    const rowY = y + rowIndex * rowHeight;

                    // Draw alternating row background
                    if (rowIndex % 2 === 0) {
                        doc.fillAndStroke("#E0E0E0", "#000000");
                    } else {
                        doc.fillColor("#000000").stroke();
                    }

                    // Draw row cells
                    row.forEach((cell, cellIndex) => {
                        const cellX = 100 + cellIndex * (tableWidth / table.headers.length);
                        doc
                            .rect(cellX, rowY, tableWidth / table.headers.length, rowHeight)
                            .fillAndStroke(
                                cellIndex % 2 === 0 ? "#FFFFFF" : "#E0E0E0",
                                "#000000"
                            );
                        doc
                            .fillColor("#000000")
                            .text(cell.toString(), cellX + cellPadding, rowY + 6, {
                                width: tableWidth / table.headers.length - 2 * cellPadding,
                                align: "center",
                                valign: "center",
                            });
                    });
                });

                // Finalize the PDF document
                doc.end();
            } catch (err) {
                console.error("Error generating PDF:", err);
                res.status(500).send("Error generating PDF");
            }
        }
    });
});

module.exports = user;