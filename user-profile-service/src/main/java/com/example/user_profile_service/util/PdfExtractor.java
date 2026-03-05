package com.example.user_profile_service.util;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class PdfExtractor {

    public String extractTextFromPdf(MultipartFile file) {
        try {
            // 1. Load the incoming PDF file into memory using PDFBox 3.0+ syntax
            PDDocument document = Loader.loadPDF(file.getBytes());

            // 2. Instantiate the text stripper
            PDFTextStripper stripper = new PDFTextStripper();

            // 3. Extract all text into a single String
            String extractedText = stripper.getText(document);

            // 4. Close the document to prevent memory leaks!
            document.close();

            return extractedText;
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract text from PDF: " + e.getMessage());
        }
    }
}
