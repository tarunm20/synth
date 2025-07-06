package com.synth.flashcard.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class FileProcessingService {

    public String extractTextFromFile(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new IllegalArgumentException("File name cannot be null");
        }

        String fileExtension = getFileExtension(fileName).toLowerCase();
        
        switch (fileExtension) {
            case "pdf":
                return extractTextFromPDF(file);
            case "txt":
                return extractTextFromTxt(file);
            default:
                throw new IllegalArgumentException("Unsupported file type: " + fileExtension);
        }
    }

    private String extractTextFromPDF(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractTextFromTxt(MultipartFile file) throws IOException {
        return new String(file.getBytes(), StandardCharsets.UTF_8);
    }

    private String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return fileName.substring(lastDotIndex + 1);
    }

    public boolean isValidFileType(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            return false;
        }
        
        String extension = getFileExtension(fileName).toLowerCase();
        return extension.equals("pdf") || extension.equals("txt");
    }

    public boolean isFileSizeValid(MultipartFile file) {
        // 10MB limit
        long maxSize = 10 * 1024 * 1024;
        return file.getSize() <= maxSize;
    }
}