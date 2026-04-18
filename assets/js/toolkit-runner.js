(function () {
  const toolId = window.location.pathname.split("/").pop().replace(".html", "");
  const appRoot = document.querySelector("#tool-app");
  if (!appRoot) return;

  const LIBRARIES = {
    pdfLib: { global: "PDFLib", url: "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js" },
    jszip: { global: "JSZip", url: "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js" },
    jspdf: { global: "jspdf", url: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" },
    jsqr: { global: "jsQR", url: "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js" },
    pdfjs: {
      global: "pdfjsLib",
      url: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
      afterLoad() {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      },
    },
    mammoth: { global: "mammoth", url: "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js" },
    html2pdf: { global: "html2pdf", url: "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" },
    marked: { global: "marked", url: "https://cdn.jsdelivr.net/npm/marked/marked.min.js" },
    qrcode: { global: "QRCode", url: "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" },
    tesseract: { global: "Tesseract", url: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js" },
    xlsx: { global: "XLSX", url: "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js" },
    pptxgenjs: { global: "PptxGenJS", url: "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js" },
  };

  const TOOLS = {
    "merge-pdf": meta("Merge PDF", "PDF", "Gabungkan beberapa PDF menjadi satu file final yang rapi.", ["Unggah beberapa file PDF", "Susun otomatis berdasarkan urutan file", "Unduh hasil gabungan dalam satu klik"], renderMergePdf),
    "split-pdf": meta("Split PDF", "PDF", "Pisahkan halaman PDF berdasarkan halaman tertentu atau rentang halaman.", ["Masukkan format seperti 1,3-5,8", "Hasil dipaketkan ke ZIP", "Cocok untuk ekstraksi halaman penting"], renderSplitPdf),
    "edit-pdf": meta("Edit PDF", "PDF", "Tambahkan watermark teks ke setiap halaman PDF langsung dari browser.", ["Atur teks watermark", "Kontrol ukuran, warna, dan opacity", "Unduh file PDF hasil edit"], renderEditPdf),
    "convert-pdf": meta("Convert PDF", "PDF", "Ekstrak isi teks dari PDF lalu simpan sebagai TXT yang bersih.", ["Ambil teks per halaman", "Preview hasil ekstraksi", "Unduh sebagai file teks"], renderConvertPdf),
    "compress-pdf": meta("Compress PDF", "PDF", "Optimalkan struktur PDF agar ukuran file bisa lebih ringan.", ["Resave dokumen dengan object streams", "Bandingkan ukuran awal dan hasil", "Unduh versi teroptimasi"], renderCompressPdf),
    "pdf-to-image": meta("PDF to Image", "PDF", "Ubah setiap halaman PDF menjadi gambar PNG atau JPEG.", ["Pilih format output", "Atur skala render", "Unduh semua halaman dalam ZIP"], renderPdfToImage),
    "digital-signature-pdf": meta("Digital Signature PDF", "PDF", "Tambahkan tanda tangan digital lewat gambar, ketikan, atau canvas draw lalu tempatkan langsung di halaman PDF.", ["Draw signature", "Tanda tangan dari foto", "Bisa dipindah dan diubah ukurannya"], renderDigitalSignaturePdf),
    "watermark-pdf": meta("Watermark PDF", "PDF", "Tambahkan watermark teks atau gambar ke seluruh halaman PDF dengan ukuran, warna, dan posisi yang fleksibel.", ["Mode teks dan gambar", "Preview langsung di editor", "Atur warna, opacity, ukuran, dan rotasi"], renderWatermarkPdf),
    "rotate-pdf": meta("Rotate PDF", "PDF", "Putar seluruh PDF atau halaman tertentu lalu simpan ulang dengan orientasi yang pas.", ["Rotasi 90, 180, 270 derajat", "Pilih semua halaman atau rentang tertentu", "Preview cepat sebelum simpan"], renderRotatePdf),
    "pdf-redactor": meta("PDF Redactor", "PDF", "Sensor area penting pada PDF dengan efek hitam, putih, blur, atau glitch.", ["Tambahkan area sensor per halaman", "Bisa drag dan resize", "Simpan hasil sensor langsung ke PDF"], renderPdfRedactor),
    "smart-pdf-editor": meta("Smart PDF Editor", "PDF", "Mini editor PDF untuk tambah teks, gambar, tanda tangan, coretan, dan elemen drag-and-drop.", ["Add text", "Add image", "Draw dan signature", "Live preview sebelum simpan"], renderSmartPdfEditor),
    "lock-pdf": meta("Lock / Unlock PDF", "PDF", "Lindungi PDF dengan password atau buka PDF yang terkunci untuk membuat salinan baru.", ["Mode lock dan unlock", "Progress proses terlihat", "Cocok untuk PDF berbagi dokumen"], renderLockPdf),
    "delete-pdf": meta("Delete PDF Pages", "PDF", "Upload file PDF lalu hapus halaman yang tidak perlu dengan preview halaman dan ekspor ulang.", ["Preview halaman kecil", "Pilih halaman yang dihapus", "Ekspor PDF baru setelah final"], renderDeletePdf),
    "compress-image": meta("Compress Image", "Image", "Kecilkan ukuran gambar sambil tetap menjaga hasil yang enak dilihat.", ["Atur kualitas kompresi", "Preview sebelum dan sesudah", "Unduh hasil gambar baru"], renderCompressImage),
    "convert-image": meta("Convert Image", "Image", "Konversi gambar ke PNG, JPEG, atau WEBP dari browser.", ["Dukungan format umum", "Preview output instan", "Unduh satu file hasil konversi"], renderConvertImage),
    "resize-image": meta("Resize Image", "Image", "Ubah dimensi gambar dengan kontrol rasio yang praktis.", ["Atur lebar dan tinggi", "Pertahankan rasio otomatis", "Preview hasil resize"], renderResizeImage),
    "crop-image": meta("Crop Image", "Image", "Potong gambar menggunakan koordinat dan ukuran yang presisi.", ["Atur X, Y, lebar, dan tinggi", "Preview hasil crop", "Unduh gambar akhir"], renderCropImage),
    "remove-background": meta("Remove Background", "Image", "Hilangkan background polos secara cepat untuk PNG transparan siap pakai.", ["Deteksi warna latar dominan", "Atur toleransi penghapusan", "Unduh hasil PNG transparan"], renderRemoveBackground),
    "image-to-text-ocr": meta("Image to Text (OCR)", "Image", "Ambil teks dari gambar menggunakan OCR langsung di browser.", ["Dukungan bahasa Indonesia dan Inggris", "Preview teks hasil ekstraksi", "Salin atau unduh TXT"], renderImageToTextOcr),
    "watermark-image": meta("Watermark Image", "Image", "Tambahkan watermark teks ke gambar dengan posisi dan opacity yang fleksibel.", ["Kontrol posisi watermark", "Atur ukuran, warna, dan transparansi", "Cocok untuk branding konten"], renderWatermarkImage),
    "enhance-image": meta("Enhance Image", "Image", "Tingkatkan kualitas visual gambar dengan auto improve yang ringan dan cepat.", ["Auto contrast dan saturasi", "Sedikit sharpening", "Preview hasil sebelum unduh"], renderEnhanceImage),
    "blur-pixelate-image": meta("Blur / Pixelate Image", "Image", "Beri efek blur atau pixelate ke seluruh gambar untuk sensor atau gaya visual.", ["Pilih mode blur atau pixelate", "Atur intensitas efek", "Output siap unduh"], renderBlurPixelateImage),
    "convert-to-webp": meta("Convert to WebP", "Image", "Ubah gambar ke format WebP yang lebih ramah performa dan SEO.", ["File lebih ringan", "Atur kualitas output", "Cocok untuk optimasi web"], renderConvertToWebp),
    "word-counter": meta("Word Counter", "Text", "Analisis teks cepat untuk jumlah kata, karakter, baris, dan estimasi baca.", ["Hitung realtime", "Tampilkan statistik penting", "Cocok untuk artikel, caption, dan draft"], renderWordCounter),
    "remove-spaces": meta("Remove Spaces", "Text", "Rapikan spasi berlebih, trim baris, dan bersihkan teks kotor.", ["Collapse multiple spaces", "Hapus baris kosong", "Salin hasil bersih"], renderRemoveSpaces),
    "remove-duplicate-lines": meta("Remove Duplicate Lines", "Text", "Buang baris duplikat dari daftar teks agar hasil lebih bersih dan unik.", ["Mode case sensitive opsional", "Pertahankan urutan pertama", "Salin hasil sekali klik"], renderRemoveDuplicateLines),
    "case-converter": meta("Case Converter", "Text", "Ubah gaya huruf ke uppercase, lowercase, title, snake, camel, dan lainnya.", ["Beberapa mode konversi", "Preview instan", "Salin hasil cepat"], renderCaseConverter),
    "text-sorter": meta("Text Sorter", "Text", "Urutkan daftar teks, hapus duplikat, atau acak susunan dalam satu klik.", ["Sort A-Z atau Z-A", "Randomize list", "Remove duplicate lines"], renderTextSorter),
    "text-compare": meta("Text Compare", "Text", "Bandingkan dua teks untuk melihat perbedaan baris secara cepat.", ["Diff checker per baris", "Tandai bagian sama, hilang, dan baru", "Cocok untuk draft revisi"], renderTextCompare),
    "json-formatter": meta("JSON Formatter", "Text", "Format, validasi, dan minify JSON untuk developer atau kebutuhan API.", ["Pretty print", "Minify cepat", "Validasi struktur JSON"], renderJsonFormatter),
    "jpg-to-png": meta("JPG to PNG", "Converter", "Ubah JPG ke PNG dengan output yang lebih bersih.", ["Upload JPG", "Preview hasil", "Unduh PNG"], renderJpgToPng),
    "png-to-jpg": meta("PNG to JPG", "Converter", "Ubah PNG ke JPG dengan kontrol warna latar belakang.", ["Pilih background untuk area transparan", "Atur kualitas", "Unduh JPG"], renderPngToJpg),
    "pdf-to-jpg": meta("PDF to JPG", "Converter", "Ubah tiap halaman PDF menjadi gambar JPG siap pakai.", ["Semua halaman diproses", "Hasil dikemas ZIP", "Preview halaman pertama"], renderPdfToJpg),
    "pdf-to-png": meta("PDF to PNG", "Converter", "Konversi halaman PDF ke PNG dengan kualitas tajam.", ["Semua halaman diproses", "Cocok untuk arsip visual", "Preview instan"], renderPdfToPng),
    "jpg-to-pdf": meta("JPG to PDF", "Converter", "Gabungkan satu atau beberapa JPG menjadi PDF.", ["Mendukung multi file", "Urutan mengikuti file", "Output PDF siap unduh"], renderJpgToPdf),
    "png-to-pdf": meta("PNG to PDF", "Converter", "Ubah PNG menjadi PDF dengan hasil rapi.", ["Dukungan multi file", "Tetap mempertahankan gambar", "Output PDF langsung"], renderPngToPdf),
    "pdf-to-word": meta("PDF to Word", "Converter", "Ekstrak teks PDF lalu simpan sebagai file DOC yang mudah dibuka.", ["Preview isi teks", "Unduh file .doc", "Praktis untuk teks non-kompleks"], renderPdfToWord),
    "word-to-pdf": meta("Word to PDF", "Converter", "Konversi DOCX atau TXT ke PDF langsung dari browser.", ["Dukungan DOCX melalui preview HTML", "Ekspor PDF", "Tetap simpel untuk dokumen umum"], renderWordToPdf),
    "pdf-to-excel": meta("PDF to Excel", "Converter", "Ambil isi teks PDF dan simpan ke workbook Excel.", ["Satu sheet per halaman", "Struktur mudah dirapikan", "Unduh XLSX"], renderPdfToExcel),
    "excel-to-pdf": meta("Excel to PDF", "Converter", "Ubah sheet Excel atau CSV menjadi PDF sederhana.", ["Baca workbook di browser", "Preview tabel", "Ekspor PDF"], renderExcelToPdf),
    "pdf-to-ppt": meta("PDF to PPT", "Converter", "Konversi tiap halaman PDF menjadi slide presentasi.", ["Satu halaman jadi satu slide", "Tetap visual", "Unduh PPTX"], renderPdfToPpt),
    "ppt-to-pdf": meta("PPT to PDF", "Converter", "Ekstrak konten slide lalu simpan sebagai PDF.", ["Baca file PPTX", "Ringkas isi slide", "Ekspor PDF"], renderPptToPdf),
    "jpg-to-webp": meta("JPG to WebP", "Converter", "Ubah JPG ke WebP agar lebih ringan.", ["Preview hasil", "Kualitas bagus", "Siap untuk web"], renderJpgToWebp),
    "png-to-webp": meta("PNG to WebP", "Converter", "Ubah PNG ke WebP dengan ukuran lebih efisien.", ["Cocok untuk optimasi web", "Preview instan", "Unduh cepat"], renderPngToWebp),
    "webp-to-jpg": meta("WebP to JPG", "Converter", "Konversi WebP ke JPG untuk kompatibilitas lebih luas.", ["Preview hasil", "Kualitas dapat diatur", "Unduh JPG"], renderWebpToJpg),
    "webp-to-png": meta("WebP to PNG", "Converter", "Konversi WebP ke PNG siap pakai.", ["Tetap simpel", "Preview instan", "Unduh PNG"], renderWebpToPng),
    "pdf-to-text": meta("PDF to Text", "Converter", "Ekstrak isi teks PDF menjadi file TXT.", ["Bisa copy hasil", "Unduh TXT", "Cocok untuk analisis teks"], renderPdfToText),
    "pdf-to-html": meta("PDF to HTML", "Converter", "Ubah isi PDF menjadi HTML sederhana yang mudah dibuka di browser.", ["Satu hasil HTML", "Tetap mudah dibaca", "Bisa preview"], renderPdfToHtml),
    "image-to-pdf": meta("Image to PDF", "Converter", "Gabungkan beberapa gambar ke satu PDF.", ["Mendukung banyak gambar", "Urut sesuai file", "Output satu dokumen"], renderImageToPdf),
    "image-to-text-ocr": meta("Image to Text (OCR)", "Converter", "Ambil teks dari gambar menggunakan OCR.", ["Bahasa Indonesia dan Inggris", "Bisa copy hasil", "Unduh TXT"], renderImageToTextOcrConverter),
    "word-to-txt": meta("Word to TXT", "Converter", "Ekstrak isi Word menjadi teks polos.", ["Dukungan DOCX dan TXT", "Preview isi", "Unduh TXT"], renderWordToTxt),
    "txt-to-word": meta("TXT to Word", "Converter", "Ubah teks biasa menjadi dokumen Word sederhana.", ["Preview layout", "Unduh DOC", "Cocok untuk draft"], renderTxtToWord),
    "html-to-pdf": meta("HTML to PDF", "Converter", "Konversi file HTML menjadi PDF dari browser.", ["Render isi HTML", "Preview sebelum ekspor", "Unduh PDF"], renderHtmlToPdf),
    "html-to-text": meta("HTML to Text", "Converter", "Ekstrak teks bersih dari file HTML.", ["Hapus tag otomatis", "Preview teks", "Unduh TXT"], renderHtmlToText),
    "markdown-to-html": meta("Markdown to HTML", "Converter", "Render Markdown menjadi HTML siap pakai.", ["Preview hasil", "Unduh HTML", "Mendukung heading dan list"], renderMarkdownToHtml),
    "markdown-to-pdf": meta("Markdown to PDF", "Converter", "Ubah Markdown menjadi PDF lewat render HTML.", ["Preview dokumen", "Ekspor PDF", "Cocok untuk catatan"], renderMarkdownToPdf),
    "text-to-pdf": meta("Text to PDF", "Converter", "Jadikan teks biasa ke file PDF.", ["Bisa dari file TXT", "Area edit manual", "Ekspor PDF"], renderTextToPdf),
    "csv-to-json": meta("CSV to JSON", "Converter", "Konversi data CSV menjadi JSON.", ["Preview hasil", "Unduh JSON", "Praktis untuk API"], renderCsvToJson),
    "json-to-csv": meta("JSON to CSV", "Converter", "Ubah data JSON menjadi CSV.", ["Mendukung array object", "Preview hasil", "Unduh CSV"], renderJsonToCsv),
    bmi: meta("BMI Calculator", "Calculator", "Hitung indeks massa tubuh dan kategorinya dalam hitungan detik.", ["Input tinggi dan berat", "Kategori otomatis", "Ringkasan status"], renderBmi),
    discount: meta("Discount Calculator", "Calculator", "Hitung harga setelah diskon dan pajak tanpa ribet.", ["Harga awal, diskon, pajak", "Lihat penghematan", "Angka final otomatis"], renderDiscount),
    percentage: meta("Percentage Calculator", "Calculator", "Selesaikan beberapa tipe hitung persen dari satu halaman.", ["X persen dari Y", "Berapa persen perubahan", "Selisih naik turun"], renderPercentage),
    "loan-cicilan": meta("Loan / Cicilan Calculator", "Calculator", "Hitung estimasi cicilan bulanan pinjaman dengan rumus anuitas.", ["Pokok pinjaman dan tenor", "Bunga per tahun", "Cicilan bulanan otomatis"], renderLoanCicilan),
    "currency-converter": meta("Currency Converter", "Calculator", "Konversi cepat antar mata uang populer dengan kurs referensi statis.", ["IDR, USD, EUR, SGD, JPY", "Mode dua arah", "Nilai hasil instan"], renderCurrencyConverter),
    "unit-converter": meta("Unit Converter (All-in-One)", "Calculator", "Konversi panjang, berat, dan suhu dalam satu halaman.", ["Panjang, berat, suhu", "Ubah satuan asal dan tujuan", "Hasil presisi otomatis"], renderUnitConverter),
    "tax-calculator": meta("Tax Calculator (PPN / VAT)", "Calculator", "Hitung pajak dari harga dasar atau pecah total yang sudah termasuk pajak.", ["Mode before tax / inclusive", "PPN atau VAT fleksibel", "Dasar, pajak, dan total"], renderTaxCalculator),
    "profit-margin": meta("Profit / Margin Calculator", "Calculator", "Hitung profit, margin, dan markup dari modal dan harga jual.", ["Harga modal dan jual", "Margin persen", "Profit per unit"], renderProfitMargin),
    "tip-calculator": meta("Tip Calculator", "Calculator", "Hitung tip restoran dan pembagian tagihan per orang dengan cepat.", ["Persentase tip", "Split bill", "Total akhir"], renderTipCalculator),
    "simple-interest": meta("Simple Interest Calculator", "Calculator", "Hitung bunga sederhana berdasarkan pokok, suku bunga, dan durasi.", ["Pokok investasi", "Rate tahunan", "Bunga dan total akhir"], renderSimpleInterest),
    "compound-interest": meta("Compound Interest Calculator", "Calculator", "Hitung bunga majemuk plus kontribusi rutin untuk simulasi tabungan atau investasi.", ["Compounding bulanan/tahunan", "Setoran rutin opsional", "Nilai akhir dan total bunga"], renderCompoundInterest),
    "age-calculator": meta("Age Calculator", "Calculator", "Hitung umur detail dari tanggal lahir sampai tanggal acuan.", ["Tahun, bulan, hari", "Total hari hidup", "Ulang tahun berikutnya"], renderAgeCalculator),
    "savings-goal": meta("Savings Goal Calculator", "Calculator", "Hitung tabungan bulanan yang dibutuhkan untuk mencapai target dana.", ["Target dana", "Dana awal", "Estimasi bunga tabungan"], renderSavingsGoalCalculator),
    "qr-generator": meta("QR Generator", "Utility", "Buat QR code dari teks, link, atau informasi singkat lalu unduh.", ["Atur ukuran dan warna", "Preview QR instan", "Unduh PNG"], renderQrGenerator),
    "qr-scanner": meta("QR Code Scanner", "Utility", "Unggah gambar QR lalu scan otomatis untuk menampilkan link atau pesan yang tersimpan.", ["Auto scan saat gambar diunggah", "Menangkap pesan teks dan URL", "Preview gambar sebelum dibaca"], renderQrScanner),
    "password-generator": meta("Password Generator", "Utility", "Hasilkan password acak yang kuat dan mudah disalin.", ["Atur panjang", "Pilih karakter", "Indikator kekuatan"], renderPasswordGenerator),
    "color-picker": meta("Color Picker", "Utility", "Pilih warna, tangkap warna layar, dan dapatkan variasi palette otomatis.", ["HEX, RGB, HSL", "Dukungan eyedropper jika tersedia", "Palette turunan otomatis"], renderColorPicker),
    "favicon-generator": meta("Favicon Generator", "Utility", "Ubah gambar menjadi favicon ICO lengkap dengan beberapa ukuran PNG siap pakai.", ["Ekspor ICO", "Paket PNG multi-size", "Preview seluruh ukuran"], renderFaviconGenerator),
    "url-encoder-decoder": meta("URL Encoder / Decoder", "Utility", "Encode atau decode URL dan query string dengan cepat.", ["Cocok untuk parameter URL", "Dua arah encode dan decode", "Salin hasil instan"], renderUrlEncoderDecoder),
    "base64-encoder-decoder": meta("Base64 Encoder / Decoder", "Utility", "Ubah teks ke Base64 atau kembalikan lagi ke bentuk semula.", ["Encode dan decode teks", "Cocok untuk payload ringan", "Copy hasil cepat"], renderBase64EncoderDecoder),
    "uuid-generator": meta("UUID Generator", "Utility", "Generate UUID v4 untuk kebutuhan ID unik, API, atau database.", ["Buat banyak UUID sekaligus", "Satu klik salin semua", "Format standar RFC"], renderUuidGenerator),
    "slug-generator": meta("Slug Generator", "Utility", "Buat slug URL yang bersih dan SEO-friendly dari judul atau keyword.", ["Normalisasi karakter", "Lowercase otomatis", "Siap dipakai untuk artikel"], renderSlugGenerator),
    "auto-chart-maker": meta("Auto Chart Maker", "Utility", "Buat chart otomatis dari Excel, TXT, PDF, atau input manual lalu edit tipe chart dan ekspor hasilnya.", ["Saran chart terbaik otomatis", "Banyak pilihan chart yang bisa diganti", "Ekspor PDF, JPG, PNG, dan WEBP"], renderAutoChartMaker),
  };

  const config = TOOLS[toolId];
  if (!config) {
    appRoot.innerHTML = `<div class="tool-surface"><h2>Tool tidak ditemukan</h2><p>Halaman ini belum memiliki konfigurasi.</p></div>`;
    return;
  }

  document.title = `${config.title} | CoreChiperTools`;
  appRoot.innerHTML = `
    <section class="tool-hero">
      <div class="breadcrumbs">
        <a href="../../index.html">Beranda</a>
        <span>/</span>
        <a href="../../pages/${config.category.toLowerCase()}.html">${config.category}</a>
        <span>/</span>
        <span>${config.title}</span>
      </div>
      <p class="eyebrow">${config.category} Tool</p>
      <h1>${config.title}</h1>
      <p>${config.description}</p>
    </section>
    <section class="tool-layout">
      <div class="tool-surface"><div id="tool-workspace" class="tool-stack"></div></div>
      <aside class="tool-panel">
        <div class="tool-stack">
          <div class="result-card"><h3>Fungsi Utama</h3><ul class="tool-list">${config.highlights.map((item) => `<li>${item}</li>`).join("")}</ul></div>
          <div class="result-card"><h3>Navigasi</h3><div class="action-row"><a class="button button-secondary" href="../../pages/${config.category.toLowerCase()}.html">Kategori ${config.category}</a><a class="button secondary-button" href="../../index.html">Beranda</a></div></div>
          <div id="tool-status" class="tool-status">Siap digunakan. Unggah file atau isi data yang dibutuhkan.</div>
          <div id="tool-extra" class="tool-stack"></div>
        </div>
      </aside>
    </section>
  `;

  const ui = {
    workspace: document.querySelector("#tool-workspace"),
    status: document.querySelector("#tool-status"),
    extra: document.querySelector("#tool-extra"),
  };

  config.render(ui);
  enableAllDropzones();

  function meta(title, category, description, highlights, render) { return { title, category, description, highlights, render }; }
  function setStatus(message, type = "info") {
    ui.status.textContent = message;
    ui.status.className = `tool-status${type === "info" ? "" : ` ${type}`}`;
  }
  function html(strings, ...values) { return strings.reduce((acc, string, index) => acc + string + (values[index] ?? ""), ""); }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function ensureLibrary(name) {
    const lib = LIBRARIES[name];
    if (!lib) throw new Error(`Library ${name} tidak ditemukan.`);
    if (window[lib.global]) return window[lib.global];
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = lib.url;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Gagal memuat library ${name}. Pastikan koneksi internet browser tersedia.`));
      document.head.appendChild(script);
    });
    if (typeof lib.afterLoad === "function") lib.afterLoad();
    return window[lib.global];
  }
  function bytesLabel(value) {
    if (!Number.isFinite(value)) return "-";
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / 1024 / 1024).toFixed(2)} MB`;
  }
  function formatNumber(value, digits = 2) { return Number(value).toLocaleString("id-ID", { maximumFractionDigits: digits }); }
  function formatCurrency(value, currency = "IDR", digits = 2) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: digits,
      minimumFractionDigits: digits === 0 ? 0 : undefined,
    }).format(Number(value) || 0);
  }
  const CURRENCY_RATES = { IDR: 1, USD: 16250, EUR: 17750, SGD: 12050, JPY: 108, GBP: 20650, AUD: 10450 };
  const UNIT_OPTIONS = {
    length: {
      meter: { label: "Meter (m)", factor: 1 },
      kilometer: { label: "Kilometer (km)", factor: 1000 },
      centimeter: { label: "Centimeter (cm)", factor: 0.01 },
      millimeter: { label: "Millimeter (mm)", factor: 0.001 },
      inch: { label: "Inch (in)", factor: 0.0254 },
      foot: { label: "Foot (ft)", factor: 0.3048 },
      yard: { label: "Yard (yd)", factor: 0.9144 },
      mile: { label: "Mile (mi)", factor: 1609.344 },
    },
    weight: {
      kilogram: { label: "Kilogram (kg)", factor: 1 },
      gram: { label: "Gram (g)", factor: 0.001 },
      milligram: { label: "Milligram (mg)", factor: 0.000001 },
      ton: { label: "Ton (t)", factor: 1000 },
      pound: { label: "Pound (lb)", factor: 0.45359237 },
      ounce: { label: "Ounce (oz)", factor: 0.028349523125 },
    },
    temperature: {
      celsius: { label: "Celsius (°C)" },
      fahrenheit: { label: "Fahrenheit (°F)" },
      kelvin: { label: "Kelvin (K)" },
    },
  };
  function escapeHtml(value) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
  function readAsArrayBuffer(file) { return file.arrayBuffer(); }
  function readAsText(file) { return file.text(); }
  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  function fileChipList(files) {
    if (!files.length) return `<p class="small-note">Belum ada file dipilih.</p>`;
    return `<div class="file-list">${files.map((file) => `<div class="file-chip"><strong>${file.name}</strong><div>${bytesLabel(file.size)}</div></div>`).join("")}</div>`;
  }
  function inputFileTemplate(options = {}) {
    return html`
      <label class="tool-field full"><span class="tool-label">${options.label || "Pilih file"}</span><input class="tool-input" type="file" ${options.accept ? `accept="${options.accept}"` : ""} ${options.multiple ? "multiple" : ""} id="${options.id}"></label>
      <div id="${options.listId}" class="tool-dropzone" data-drop-input="${options.id}"><strong>File siap diproses</strong><p class="small-note">${options.note || "Unggah file dari perangkat Anda."}</p></div>
    `;
  }
  function enableAllDropzones() {
    document.querySelectorAll(".tool-dropzone[data-drop-input]").forEach((zone) => {
      if (zone.dataset.dropReady === "yes") return;
      const input = document.querySelector(`#${zone.dataset.dropInput}`);
      if (!input) return;
      zone.dataset.dropReady = "yes";
      zone.tabIndex = 0;
      zone.addEventListener("click", () => input.click());
      zone.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          input.click();
        }
      });
      ["dragenter", "dragover"].forEach((name) => zone.addEventListener(name, (event) => {
        event.preventDefault();
        zone.classList.add("is-dragover");
      }));
      ["dragleave", "drop"].forEach((name) => zone.addEventListener(name, (event) => {
        event.preventDefault();
        zone.classList.remove("is-dragover");
      }));
      zone.addEventListener("drop", (event) => {
        const files = [...(event.dataTransfer?.files || [])];
        if (!files.length) return;
        const transfer = new DataTransfer();
        files.forEach((file) => transfer.items.add(file));
        input.files = transfer.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }
  function canvasToBlob(canvas, type = "image/png", quality) { return new Promise((resolve) => canvas.toBlob(resolve, type, quality)); }
  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  function loadImageFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }
  function parseRanges(input, maxPages) {
    const chunks = input.split(",").map((part) => part.trim()).filter(Boolean);
    if (!chunks.length) return [];
    const result = [];
    for (const chunk of chunks) {
      if (chunk.includes("-")) {
        const [startRaw, endRaw] = chunk.split("-");
        const start = Number(startRaw);
        const end = Number(endRaw);
        if (!start || !end || start > end || end > maxPages) throw new Error(`Rentang "${chunk}" tidak valid.`);
        result.push(Array.from({ length: end - start + 1 }, (_, index) => start + index));
      } else {
        const page = Number(chunk);
        if (!page || page > maxPages) throw new Error(`Halaman "${chunk}" tidak valid.`);
        result.push([page]);
      }
    }
    return result;
  }
  async function extractPdfText(file) {
    const pdfjsLib = await ensureLibrary("pdfjs");
    const buffer = await readAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pages = [];
    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ").replace(/\s+/g, " ").trim();
      pages.push(`Halaman ${pageIndex}\n${pageText}`);
    }
    return pages.join("\n\n");
  }
  async function extractPdfStructured(file) {
    const pdfjsLib = await ensureLibrary("pdfjs");
    const buffer = await readAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pages = [];
    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const viewport = page.getViewport({ scale: 1.25 });
      const content = await page.getTextContent();
      const lineMap = new Map();
      content.items.forEach((item) => {
        const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
        const x = tx[4];
        const y = tx[5];
        const fontSize = Math.max(10, Math.abs(tx[0] || item.height || 12));
        const key = Math.round(y / 8) * 8;
        if (!lineMap.has(key)) lineMap.set(key, []);
        lineMap.get(key).push({ text: item.str, x, y, fontSize });
      });
      const lines = [...lineMap.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, values]) => values.sort((a, b) => a.x - b.x))
        .map((values) => {
          const text = values.map((part) => part.text).join(" ").replace(/\s+/g, " ").trim();
          const left = Math.min(...values.map((part) => part.x));
          const fontSize = values.reduce((sum, part) => sum + part.fontSize, 0) / values.length;
          return { text, left, fontSize };
        })
        .filter((line) => line.text);
      pages.push({ width: viewport.width, height: viewport.height, lines });
    }
    return pages;
  }
  async function renderPdfPages(file, scale, onPage) {
    const pdfjsLib = await ensureLibrary("pdfjs");
    const pdf = await pdfjsLib.getDocument({ data: await readAsArrayBuffer(file) }).promise;
    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      await onPage(canvas, pageIndex, pdf.numPages);
    }
  }
  function showPreview(content) {
    const preview = document.querySelector("#tool-preview");
    if (!preview) return;
    preview.innerHTML = "";
    if (typeof content === "string") preview.innerHTML = content;
    else preview.appendChild(content);
  }
  function createExportStage(innerHtml, className = "document-export-sheet") {
    const stage = document.createElement("div");
    stage.className = className;
    stage.style.position = "absolute";
    stage.style.left = "0";
    stage.style.top = "0";
    stage.style.width = "794px";
    stage.style.background = "#ffffff";
    stage.style.padding = "32px 28px";
    stage.style.boxSizing = "border-box";
    stage.style.opacity = "0.01";
    stage.style.pointerEvents = "none";
    stage.style.zIndex = "0";
    stage.style.overflow = "hidden";
    stage.innerHTML = innerHtml;
    document.body.appendChild(stage);
    return stage;
  }
  async function extractWordDocument(file) {
    if (file.name.toLowerCase().endsWith(".docx")) {
      const mammoth = await ensureLibrary("mammoth");
      const [htmlResult, rawResult] = await Promise.all([
        mammoth.convertToHtml({ arrayBuffer: await readAsArrayBuffer(file) }),
        mammoth.extractRawText({ arrayBuffer: await readAsArrayBuffer(file) }),
      ]);
      return {
        html: htmlResult.value,
        text: rawResult.value || "",
        rich: true,
      };
    }
    const text = await readAsText(file);
    return {
      html: `<pre class="text-file-preview">${escapeHtml(text)}</pre>`,
      text,
      rich: false,
    };
  }
  async function exportTextDocumentToPdf(text, filename) {
    const { jsPDF } = (await ensureLibrary("jspdf")).jsPDF ? (await ensureLibrary("jspdf")) : window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginX = 14;
    const marginY = 16;
    const maxWidth = pageWidth - marginX * 2;
    const lineHeight = 6.4;
    let cursorY = marginY;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    const paragraphs = String(text)
      .replace(/\r/g, "")
      .split("\n")
      .map((line) => line.trimEnd());

    for (const paragraph of paragraphs) {
      const safeParagraph = paragraph || " ";
      const lines = pdf.splitTextToSize(safeParagraph, maxWidth);
      const blockHeight = Math.max(lineHeight, lines.length * lineHeight);
      if (cursorY + blockHeight > pageHeight - marginY) {
        pdf.addPage();
        cursorY = marginY;
      }
      pdf.text(lines, marginX, cursorY);
      cursorY += blockHeight;
      if (paragraph === "") cursorY += 1.5;
    }

    pdf.save(filename);
  }
  function downloadTextFile(text, filename, type = "text/plain;charset=utf-8") {
    downloadBlob(new Blob([text], { type }), filename);
  }
  async function exportHtmlToPdfDocument(innerHtml, filename) {
    const exportTarget = createExportStage(innerHtml, "document-export-sheet rich-export-sheet");
    try {
      const html2pdf = await ensureLibrary("html2pdf");
      await new Promise((resolve) => setTimeout(resolve, 180));
      await html2pdf().set({
        margin: [8, 8, 8, 8],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: 794,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      }).from(exportTarget).save();
    } finally {
      exportTarget.remove();
    }
  }
  async function embedImageOnPdfPage(pdf, file) {
    const image = await loadImageFromFile(file);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext("2d").drawImage(image, 0, 0);
    const pngBytes = await canvasToBlob(canvas, "image/png").then((blob) => blob.arrayBuffer());
    const embedded = await pdf.embedPng(pngBytes);
    const page = pdf.addPage();
    const margin = 24;
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const ratio = Math.min((pageWidth - margin * 2) / embedded.width, (pageHeight - margin * 2) / embedded.height);
    const width = embedded.width * ratio;
    const height = embedded.height * ratio;
    page.drawImage(embedded, {
      x: (pageWidth - width) / 2,
      y: (pageHeight - height) / 2,
      width,
      height,
    });
  }
  async function createPdfFromImageFiles(files, filename) {
    const { PDFDocument } = await ensureLibrary("pdfLib");
    const pdf = await PDFDocument.create();
    for (const file of files) await embedImageOnPdfPage(pdf, file);
    downloadBlob(new Blob([await pdf.save()], { type: "application/pdf" }), filename);
  }
  async function readFileAsHtml(file) {
    return readAsText(file);
  }
  function htmlToPlainText(htmlText) {
    const parser = new DOMParser();
    const documentNode = parser.parseFromString(htmlText, "text/html");
    return (documentNode.body?.textContent || "").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  }
  async function markdownToHtml(markdownText) {
    const markedLib = await ensureLibrary("marked");
    const parser = markedLib.parse ? markedLib : markedLib.marked;
    return parser.parse(markdownText);
  }
  function csvTextToJson(csvText) {
    const XLSX = window.XLSX;
    const workbook = XLSX.read(csvText, { type: "string" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, { defval: "" });
  }
  function jsonToCsvText(jsonText) {
    const XLSX = window.XLSX;
    const parsed = JSON.parse(jsonText);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    const sheet = XLSX.utils.json_to_sheet(rows);
    return XLSX.utils.sheet_to_csv(sheet);
  }
  async function extractPptxSlides(file) {
    const JSZip = await ensureLibrary("jszip");
    const zip = await JSZip.loadAsync(await readAsArrayBuffer(file));
    const slides = Object.keys(zip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => {
        const numberA = Number((a.match(/slide(\d+)\.xml/i) || [])[1] || 0);
        const numberB = Number((b.match(/slide(\d+)\.xml/i) || [])[1] || 0);
        return numberA - numberB;
      });
    const parser = new DOMParser();
    const result = [];
    for (const [index, name] of slides.entries()) {
      const xml = await zip.files[name].async("text");
      const xmlDoc = parser.parseFromString(xml, "application/xml");
      const values = [...xmlDoc.getElementsByTagName("a:t")].map((node) => node.textContent || "").filter(Boolean);
      result.push({ title: `Slide ${index + 1}`, text: values.join("\n").trim() });
    }
    return result;
  }
  function createProgressCard(title = "Progress Proses") {
    const card = document.createElement("div");
    card.className = "result-card progress-card";
    card.innerHTML = `
      <h3>${title}</h3>
      <div class="progress-shell"><div class="progress-bar" style="width:0%"></div></div>
      <div class="progress-meta"><strong>0%</strong><span>Menunggu proses dimulai.</span></div>
    `;
    ui.extra.prepend(card);
    return {
      card,
      update(percent, message) {
        const value = Math.max(0, Math.min(100, Number(percent) || 0));
        let nextMessage = message;
        if (value >= 95 && value < 100) {
          const warning = "Proses akhir biasanya terlihat seperti stuck. Jangan close browser atau refresh halaman, tunggu sampai file selesai disusun.";
          nextMessage = message ? `${message} ${warning}` : warning;
        }
        card.querySelector(".progress-bar").style.width = `${value}%`;
        card.querySelector(".progress-meta strong").textContent = `${Math.round(value)}%`;
        card.querySelector(".progress-meta span").textContent = nextMessage;
      },
    };
  }
  function dataUrlToUint8Array(dataUrl) {
    const base64 = dataUrl.split(",")[1] || "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return bytes;
  }
  async function blobToDataUrl(blob) {
    const buffer = await blob.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(buffer);
    bytes.forEach((value) => { binary += String.fromCharCode(value); });
    return `data:${blob.type || "application/octet-stream"};base64,${btoa(binary)}`;
  }
  async function imageFileToDataUrl(file) {
    return blobToDataUrl(file);
  }
  function getImageDimensionsFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = dataUrl;
    });
  }
  function percentLabel(current, total) {
    if (!total) return 0;
    return (current / total) * 100;
  }
  function waitForNextFrame() {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(() => resolve());
        return;
      }
      setTimeout(resolve, 0);
    });
  }
  async function yieldToBrowser() {
    await waitForNextFrame();
  }
  function debounce(callback, delay = 120) {
    let timeoutId = null;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => callback(...args), delay);
    };
  }
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function safeRatio(value, total, fallback = 0) {
    if (!total) return fallback;
    return clamp(value / total, 0, 1);
  }
  function hexToRgbObject(hex) {
    const rgb = hexToRgb(hex);
    return { r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 };
  }
  function trimCanvasToContent(canvas, options = {}) {
    const context = canvas.getContext("2d");
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;
    const alphaThreshold = options.alphaThreshold ?? 16;
    const whiteThreshold = options.whiteThreshold ?? 248;
    const padding = options.padding ?? 12;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = ((y * width) + x) * 4;
        const alpha = data[offset + 3];
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        const hasVisibleInk = alpha > alphaThreshold && (red < whiteThreshold || green < whiteThreshold || blue < whiteThreshold);
        if (!hasVisibleInk) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    if (maxX < minX || maxY < minY) return canvas;
    const trimmed = document.createElement("canvas");
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropWidth = Math.min(width - cropX, (maxX - minX) + 1 + (padding * 2));
    const cropHeight = Math.min(height - cropY, (maxY - minY) + 1 + (padding * 2));
    trimmed.width = Math.max(1, cropWidth);
    trimmed.height = Math.max(1, cropHeight);
    trimmed.getContext("2d").drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, trimmed.width, trimmed.height);
    return trimmed;
  }
  function canvasHasVisibleInk(canvas, options = {}) {
    const context = canvas.getContext("2d");
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    const alphaThreshold = options.alphaThreshold ?? 10;
    const whiteThreshold = options.whiteThreshold ?? 245;
    for (let offset = 0; offset < data.length; offset += 4) {
      const alpha = data[offset + 3];
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      if (alpha > alphaThreshold && (red < whiteThreshold || green < whiteThreshold || blue < whiteThreshold)) return true;
    }
    return false;
  }
  function createSignatureAssetFromCanvas(sourceCanvas, options = {}) {
    const trimmedCanvas = trimCanvasToContent(sourceCanvas, {
      padding: options.padding ?? 16,
      alphaThreshold: options.alphaThreshold ?? 10,
      whiteThreshold: options.whiteThreshold ?? 245,
    });
    return {
      dataUrl: trimmedCanvas.toDataURL("image/png"),
      width: trimmedCanvas.width,
      height: trimmedCanvas.height,
    };
  }
  async function createSignatureAssetFromDataUrl(dataUrl, options = {}) {
    const image = await loadImageFromDataUrl(dataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width || 1;
    canvas.height = image.naturalHeight || image.height || 1;
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    return createSignatureAssetFromCanvas(canvas, options);
  }
  function makeSignatureAsset(text, options = {}) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const size = options.size || 52;
    canvas.width = 900;
    canvas.height = 240;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = options.color || "#182433";
    context.font = `italic ${size}px "Segoe Script", "Brush Script MT", cursive`;
    context.textBaseline = "middle";
    context.fillText(text, 32, canvas.height / 2);
    return createSignatureAssetFromCanvas(canvas, { padding: options.padding ?? 20, whiteThreshold: 250 });
  }
  function makeSignatureDataUrl(text, options = {}) {
    return makeSignatureAsset(text, options).dataUrl;
  }
  async function createIcoBlobFromPngBlobs(entries) {
    const headerSize = 6;
    const directorySize = 16 * entries.length;
    const blobs = await Promise.all(entries.map(async (entry) => ({
      size: entry.size,
      bytes: new Uint8Array(await entry.blob.arrayBuffer()),
    })));
    let offset = headerSize + directorySize;
    const totalSize = headerSize + directorySize + blobs.reduce((sum, item) => sum + item.bytes.length, 0);
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true);
    view.setUint16(4, blobs.length, true);
    blobs.forEach((entry, index) => {
      const dirOffset = 6 + (index * 16);
      const sizeByte = entry.size >= 256 ? 0 : entry.size;
      view.setUint8(dirOffset, sizeByte);
      view.setUint8(dirOffset + 1, sizeByte);
      view.setUint8(dirOffset + 2, 0);
      view.setUint8(dirOffset + 3, 0);
      view.setUint16(dirOffset + 4, 1, true);
      view.setUint16(dirOffset + 6, 32, true);
      view.setUint32(dirOffset + 8, entry.bytes.length, true);
      view.setUint32(dirOffset + 12, offset, true);
      new Uint8Array(buffer, offset, entry.bytes.length).set(entry.bytes);
      offset += entry.bytes.length;
    });
    return new Blob([buffer], { type: "image/x-icon" });
  }
  function createGenericFileShell(options) {
    return html`
      <div class="tool-form-grid">
        ${inputFileTemplate({ id: options.inputId, listId: options.listId, label: options.label, accept: options.accept, note: options.note, multiple: options.multiple })}
        ${options.fields || ""}
      </div>
      ${options.preview ? `<div class="tool-preview ${options.previewClass || ""}" id="${options.previewId || "tool-preview"}"><p class="small-note">${options.previewText || "Preview akan tampil di sini."}</p></div>` : ""}
      <div class="action-row">${options.actions || ""}</div>
    `;
  }
  function syncItemLegacyRatios(pageData, item) {
    const canvasWidth = pageData.canvas?.width || pageData.width || 1;
    const canvasHeight = pageData.canvas?.height || pageData.height || 1;
    item.xRatio = safeRatio(item.canvasX ?? 0, canvasWidth);
    item.yRatio = safeRatio(item.canvasY ?? 0, canvasHeight);
    item.widthRatio = safeRatio(item.canvasWidth ?? Math.max(40, canvasWidth * 0.18), canvasWidth, 0.18);
    item.heightRatio = safeRatio(item.canvasHeight ?? Math.max(24, canvasHeight * 0.08), canvasHeight, 0.08);
  }
  function syncItemPdfBox(pageData, item) {
    const canvasWidth = pageData.canvas?.width || pageData.width || 1;
    const canvasHeight = pageData.canvas?.height || pageData.height || 1;
    const pdfWidth = pageData.pdfWidth || canvasWidth;
    const pdfHeight = pageData.pdfHeight || canvasHeight;
    const source = getCanvasItemMetrics(pageData, item);
    const scaleX = pdfWidth / Math.max(canvasWidth, 1);
    const scaleY = pdfHeight / Math.max(canvasHeight, 1);
    item.pdfX = source.x * scaleX;
    item.pdfY = pdfHeight - ((source.y + source.itemHeight) * scaleY);
    item.pdfWidth = source.itemWidth * scaleX;
    item.pdfHeight = source.itemHeight * scaleY;
  }
  function getCanvasItemMetrics(pageData, item) {
    const canvasWidth = pageData.canvas?.width || pageData.width || 1;
    const canvasHeight = pageData.canvas?.height || pageData.height || 1;
    const itemWidth = clamp(item.canvasWidth ?? ((item.widthRatio ?? 0.18) * canvasWidth), 40, canvasWidth);
    const itemHeight = clamp(item.canvasHeight ?? ((item.heightRatio ?? 0.08) * canvasHeight), 24, canvasHeight);
    const x = clamp(item.canvasX ?? ((item.xRatio ?? 0.05) * canvasWidth), 0, Math.max(0, canvasWidth - itemWidth));
    const y = clamp(item.canvasY ?? ((item.yRatio ?? 0.08) * canvasHeight), 0, Math.max(0, canvasHeight - itemHeight));
    return { width: canvasWidth, height: canvasHeight, itemWidth, itemHeight, x, y };
  }
  function getDisplayMetrics(pageData, item) {
    const canvasMetrics = getCanvasItemMetrics(pageData, item);
    const width = pageData.displayWidth || pageData.width || 1;
    const height = pageData.displayHeight || pageData.height || 1;
    const scaleX = width / Math.max(canvasMetrics.width, 1);
    const scaleY = height / Math.max(canvasMetrics.height, 1);
    const itemWidth = canvasMetrics.itemWidth * scaleX;
    const itemHeight = canvasMetrics.itemHeight * scaleY;
    const x = canvasMetrics.x * scaleX;
    const y = canvasMetrics.y * scaleY;
    return { width, height, itemWidth, itemHeight, x, y };
  }
  function fitRect(frameWidth, frameHeight, assetWidth, assetHeight) {
    const safeAssetWidth = assetWidth || frameWidth || 1;
    const safeAssetHeight = assetHeight || frameHeight || 1;
    const frameRatio = frameWidth / frameHeight;
    const assetRatio = safeAssetWidth / safeAssetHeight;
    let drawWidth = frameWidth;
    let drawHeight = frameHeight;
    if (assetRatio > frameRatio) drawHeight = frameWidth / assetRatio;
    else drawWidth = frameHeight * assetRatio;
    return {
      width: drawWidth,
      height: drawHeight,
      x: (frameWidth - drawWidth) / 2,
      y: (frameHeight - drawHeight) / 2,
    };
  }

  function renderMergePdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "merge-files", listId: "merge-file-list", label: "Tambah file PDF ke antrian", accept: ".pdf,application/pdf", multiple: true, note: "Anda bisa menambahkan file sedikit demi sedikit, lalu atur urutannya sesuai kebutuhan." })}</div><div class="action-row"><button class="button button-primary" id="merge-run" type="button">Gabungkan PDF</button><button class="button secondary-button" id="merge-clear" type="button">Kosongkan Antrian</button></div>`;
    const input = document.querySelector("#merge-files");
    const list = document.querySelector("#merge-file-list");
    const queuedFiles = [];
    let draggedIndex = null;

    const buildMergeCard = (item, index) => `
      <div class="merge-card sortable-item" draggable="true" data-index="${index}">
        <div class="merge-badge">${bytesLabel(item.file.size)} - ${item.pages ?? "..."} halaman</div>
        <div class="merge-thumb-wrap">
          <div class="merge-thumb">${item.thumbnail ? `<img src="${item.thumbnail}" alt="${item.file.name}">` : `<span class="merge-thumb-placeholder">PDF</span>`}</div>
          <div class="merge-controls">
            <button class="merge-icon" type="button" data-action="up" data-index="${index}" ${index === 0 ? "disabled" : ""} title="Geser ke kiri">←</button>
            <button class="merge-icon" type="button" data-action="down" data-index="${index}" ${index === queuedFiles.length - 1 ? "disabled" : ""} title="Geser ke kanan">→</button>
            <button class="merge-icon danger" type="button" data-action="remove" data-index="${index}" title="Hapus file">×</button>
          </div>
        </div>
        <div class="merge-name" title="${item.file.name}">${item.file.name}</div>
      </div>
    `;

    const renderQueue = () => {
      if (!queuedFiles.length) {
        list.innerHTML = `<strong>File siap diproses</strong><p class="small-note">Belum ada file di antrian. Tambahkan PDF satu per satu atau sekaligus.</p>`;
        return;
      }
      list.innerHTML = `<strong>Antrian PDF</strong><p class="small-note">Atur posisi file sampai urutannya pas sebelum digabungkan.</p><div class="merge-board sortable-list">${queuedFiles.map((item, index) => buildMergeCard(item, index)).join("")}</div>`;
    };

    const moveItem = (fromIndex, toIndex) => {
      if (fromIndex === toIndex || toIndex < 0 || toIndex >= queuedFiles.length) return;
      const [moved] = queuedFiles.splice(fromIndex, 1);
      queuedFiles.splice(toIndex, 0, moved);
      renderQueue();
    };

    const enrichPdfItem = async (file) => {
      const pdfjsLib = await ensureLibrary("pdfjs");
      const task = pdfjsLib.getDocument({ data: await readAsArrayBuffer(file) });
      const pdf = await task.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.45 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: context, viewport }).promise;
      return {
        file,
        pages: pdf.numPages,
        thumbnail: canvas.toDataURL("image/png"),
      };
    };

    input.addEventListener("change", async () => {
      const newFiles = [...input.files];
      if (!newFiles.length) return;
      setStatus("Menyiapkan thumbnail PDF...");
      const enrichedFiles = [];
      for (const file of newFiles) {
        enrichedFiles.push(await enrichPdfItem(file));
      }
      queuedFiles.push(...enrichedFiles);
      input.value = "";
      renderQueue();
      setStatus(`${newFiles.length} file PDF ditambahkan ke antrian.`);
    });

    list.addEventListener("click", (event) => {
      const target = event.target.closest("[data-action]");
      if (!target) return;
      const index = Number(target.dataset.index);
      if (target.dataset.action === "remove") queuedFiles.splice(index, 1);
      if (target.dataset.action === "up") moveItem(index, index - 1);
      if (target.dataset.action === "down") moveItem(index, index + 1);
      renderQueue();
    });

    list.addEventListener("dragstart", (event) => {
      const item = event.target.closest(".sortable-item");
      if (!item) return;
      draggedIndex = Number(item.dataset.index);
      item.classList.add("dragging");
    });

    list.addEventListener("dragend", (event) => {
      const item = event.target.closest(".sortable-item");
      if (item) item.classList.remove("dragging");
      draggedIndex = null;
    });

    list.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    list.addEventListener("drop", (event) => {
      event.preventDefault();
      const item = event.target.closest(".sortable-item");
      if (!item || draggedIndex === null) return;
      moveItem(draggedIndex, Number(item.dataset.index));
      draggedIndex = null;
    });

    document.querySelector("#merge-clear").addEventListener("click", () => {
      queuedFiles.length = 0;
      renderQueue();
      setStatus("Antrian merge PDF dikosongkan.");
    });

    renderQueue();

    document.querySelector("#merge-run").addEventListener("click", async () => {
      const items = [...queuedFiles];
      if (items.length < 2) return setStatus("Tambahkan minimal dua file PDF ke antrian untuk digabung.", "warn");
      try {
        setStatus("Menggabungkan PDF...");
        const { PDFDocument } = await ensureLibrary("pdfLib");
        const merged = await PDFDocument.create();
        for (const item of items) {
          const src = await PDFDocument.load(await readAsArrayBuffer(item.file));
          const pages = await merged.copyPages(src, src.getPageIndices());
          pages.forEach((page) => merged.addPage(page));
        }
        downloadBlob(new Blob([await merged.save()], { type: "application/pdf" }), "corechiper-merged.pdf");
        setStatus(`Berhasil menggabungkan ${items.length} file PDF.`);
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderSplitPdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "split-file", listId: "split-file-list", label: "Pilih file PDF", accept: ".pdf,application/pdf", note: "Masukkan PDF yang ingin dipisah." })}<label class="tool-field full"><span class="tool-label">Rentang halaman</span><input class="tool-input" id="split-ranges" type="text" placeholder="Contoh: 1,3-5,8"></label></div><div class="action-row"><button class="button button-primary" id="split-run" type="button">Pisahkan ke ZIP</button></div>`;
    const input = document.querySelector("#split-file");
    const list = document.querySelector("#split-file-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#split-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Memisahkan halaman PDF...");
        const { PDFDocument } = await ensureLibrary("pdfLib");
        const JSZip = await ensureLibrary("jszip");
        const source = await PDFDocument.load(await readAsArrayBuffer(file));
        const ranges = parseRanges(document.querySelector("#split-ranges").value, source.getPageCount());
        if (!ranges.length) return setStatus("Masukkan minimal satu halaman atau rentang halaman.", "warn");
        const zip = new JSZip();
        for (let index = 0; index < ranges.length; index += 1) {
          const doc = await PDFDocument.create();
          const pages = await doc.copyPages(source, ranges[index].map((page) => page - 1));
          pages.forEach((page) => doc.addPage(page));
          zip.file(`split-${index + 1}.pdf`, await doc.save());
        }
        downloadBlob(await zip.generateAsync({ type: "blob" }), "corechiper-split-pdf.zip");
        setStatus(`Berhasil membuat ${ranges.length} file PDF terpisah.`);
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderEditPdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "edit-file", listId: "edit-file-list", label: "Pilih file PDF", accept: ".pdf,application/pdf", note: "Tambahkan watermark teks ke semua halaman." })}<label class="tool-field full"><span class="tool-label">Teks watermark</span><input class="tool-input" id="edit-text" type="text" value="CoreChiperTools"></label><label class="tool-field"><span class="tool-label">Ukuran font</span><input class="tool-input" id="edit-size" type="number" min="12" max="96" value="34"></label><label class="tool-field"><span class="tool-label">Opacity</span><input class="tool-input" id="edit-opacity" type="number" min="0.05" max="1" step="0.05" value="0.18"></label><label class="tool-field"><span class="tool-label">Warna</span><input class="tool-input" id="edit-color" type="color" value="#d3541e"></label></div><div class="action-row"><button class="button button-primary" id="edit-run" type="button">Terapkan Watermark</button></div>`;
    const input = document.querySelector("#edit-file");
    const list = document.querySelector("#edit-file-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#edit-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Menambahkan watermark ke PDF...");
        const { PDFDocument, StandardFonts, rgb, degrees } = await ensureLibrary("pdfLib");
        const pdf = await PDFDocument.load(await readAsArrayBuffer(file));
        const font = await pdf.embedFont(StandardFonts.HelveticaBold);
        const watermark = document.querySelector("#edit-text").value.trim();
        const fontSize = Number(document.querySelector("#edit-size").value);
        const opacity = Number(document.querySelector("#edit-opacity").value);
        const color = hexToRgb(document.querySelector("#edit-color").value);
        pdf.getPages().forEach((page) => {
          const { width, height } = page.getSize();
          page.drawText(watermark, { x: width / 2 - (watermark.length * fontSize * 0.24), y: height / 2, size: fontSize, font, color: rgb(color.r / 255, color.g / 255, color.b / 255), rotate: degrees(35), opacity });
        });
        downloadBlob(new Blob([await pdf.save()], { type: "application/pdf" }), "corechiper-watermarked.pdf");
        setStatus("Watermark berhasil ditambahkan ke PDF.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderConvertPdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "convert-file", listId: "convert-file-list", label: "Pilih file PDF", accept: ".pdf,application/pdf", note: "Ekstrak isi teks utama dari PDF." })}<label class="tool-field full"><span class="tool-label">Hasil ekstraksi</span><textarea class="tool-textarea" id="convert-output" placeholder="Teks hasil ekstraksi akan muncul di sini."></textarea></label></div><div class="action-row"><button class="button button-primary" id="convert-run" type="button">Ekstrak Teks</button><button class="button secondary-button" id="convert-download" type="button">Unduh TXT</button></div>`;
    const input = document.querySelector("#convert-file");
    const list = document.querySelector("#convert-file-list");
    const output = document.querySelector("#convert-output");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#convert-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try { setStatus("Mengekstrak teks dari PDF..."); output.value = await extractPdfText(file); setStatus("Teks berhasil diekstrak dari PDF."); } catch (error) { setStatus(error.message, "error"); }
    });
    document.querySelector("#convert-download").addEventListener("click", () => {
      if (!output.value.trim()) return setStatus("Belum ada teks yang bisa diunduh.", "warn");
      downloadBlob(new Blob([output.value], { type: "text/plain;charset=utf-8" }), "corechiper-pdf.txt");
      setStatus("File TXT berhasil diunduh.");
    });
  }

  function renderCompressPdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "compress-pdf-file", listId: "compress-pdf-list", label: "Pilih file PDF", accept: ".pdf,application/pdf", note: "Optimasi ini paling efektif untuk PDF umum tanpa proteksi." })}<div class="result-card full"><h3>Perbandingan Ukuran</h3><div class="stats-grid"><div class="stat-chip"><strong id="pdf-before">-</strong><span>Sebelum</span></div><div class="stat-chip"><strong id="pdf-after">-</strong><span>Sesudah</span></div></div></div></div><div class="action-row"><button class="button button-primary" id="compress-pdf-run" type="button">Optimalkan PDF</button></div>`;
    const input = document.querySelector("#compress-pdf-file");
    const list = document.querySelector("#compress-pdf-list");
    input.addEventListener("change", () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      const file = input.files[0];
      document.querySelector("#pdf-before").textContent = file ? bytesLabel(file.size) : "-";
      document.querySelector("#pdf-after").textContent = "-";
    });
    document.querySelector("#compress-pdf-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Mengoptimalkan PDF...");
        const { PDFDocument } = await ensureLibrary("pdfLib");
        const pdf = await PDFDocument.load(await readAsArrayBuffer(file));
        const result = await pdf.save({ useObjectStreams: true, addDefaultPage: false });
        document.querySelector("#pdf-after").textContent = bytesLabel(result.length);
        downloadBlob(new Blob([result], { type: "application/pdf" }), "corechiper-optimized.pdf");
        setStatus("PDF teroptimasi sudah siap diunduh. Hasil kompresi bisa berbeda tergantung struktur file.", result.length >= file.size ? "warn" : "info");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderPdfToImage() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "pdf-image-file", listId: "pdf-image-list", label: "Pilih file PDF", accept: ".pdf,application/pdf", note: "Setiap halaman akan diubah menjadi gambar." })}<label class="tool-field"><span class="tool-label">Format output</span><select class="tool-select" id="pdf-image-format"><option value="png">PNG</option><option value="jpeg">JPEG</option></select></label><label class="tool-field"><span class="tool-label">Skala render</span><input class="tool-input" id="pdf-image-scale" type="number" value="1.8" min="1" max="3" step="0.2"></label></div><div class="tool-preview" id="tool-preview"><p class="small-note">Preview halaman pertama akan tampil di sini.</p></div><div class="action-row"><button class="button button-primary" id="pdf-image-run" type="button">Konversi ke Gambar</button></div>`;
    const input = document.querySelector("#pdf-image-file");
    const list = document.querySelector("#pdf-image-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#pdf-image-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Mengubah PDF menjadi gambar...");
        const JSZip = await ensureLibrary("jszip");
        const zip = new JSZip();
        const format = document.querySelector("#pdf-image-format").value;
        const mime = format === "png" ? "image/png" : "image/jpeg";
        const quality = format === "png" ? undefined : 0.92;
        let previewSet = false;
        await renderPdfPages(file, Number(document.querySelector("#pdf-image-scale").value), async (canvas, pageIndex) => {
          if (!previewSet) { previewSet = true; showPreview(canvas); }
          zip.file(`page-${pageIndex}.${format}`, await canvasToBlob(canvas, mime, quality));
        });
        downloadBlob(await zip.generateAsync({ type: "blob" }), "corechiper-pdf-images.zip");
        setStatus("Semua halaman PDF berhasil diekspor menjadi gambar.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderCompressImage() { renderCanvasImageTool({ buttonLabel: "Kompres Gambar", extraFields: `<label class="tool-field"><span class="tool-label">Format output</span><select class="tool-select" id="image-output-format"><option value="image/jpeg">JPEG</option><option value="image/webp">WEBP</option></select></label><label class="tool-field"><span class="tool-label">Kualitas (0.1 - 1)</span><input class="tool-input" id="image-quality" type="number" min="0.1" max="1" step="0.05" value="0.72"></label>`, onRun: async ({ image, canvas }) => { canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; canvas.getContext("2d").drawImage(image, 0, 0); const format = document.querySelector("#image-output-format").value; return { blob: await canvasToBlob(canvas, format, Number(document.querySelector("#image-quality").value)), filename: `compressed.${format.includes("jpeg") ? "jpg" : "webp"}` }; } }); }
  function renderConvertImage() { renderCanvasImageTool({ buttonLabel: "Konversi Gambar", extraFields: `<label class="tool-field"><span class="tool-label">Format output</span><select class="tool-select" id="convert-image-format"><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WEBP</option></select></label>`, onRun: async ({ image, canvas }) => { canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; canvas.getContext("2d").drawImage(image, 0, 0); const format = document.querySelector("#convert-image-format").value; return { blob: await canvasToBlob(canvas, format, 0.92), filename: `converted.${format.split("/")[1].replace("jpeg", "jpg")}` }; } }); }
  function renderResizeImage() { renderCanvasImageTool({ buttonLabel: "Resize Gambar", extraFields: `<label class="tool-field"><span class="tool-label">Lebar</span><input class="tool-input" id="resize-width" type="number" min="1"></label><label class="tool-field"><span class="tool-label">Tinggi</span><input class="tool-input" id="resize-height" type="number" min="1"></label><label class="tool-field full"><span class="tool-label">Rasio</span><select class="tool-select" id="resize-lock"><option value="yes">Pertahankan rasio</option><option value="no">Bebas</option></select></label>`, onLoaded(image) { document.querySelector("#resize-width").value = image.naturalWidth; document.querySelector("#resize-height").value = image.naturalHeight; }, onRun: async ({ image, canvas }) => { const widthInput = document.querySelector("#resize-width"); const heightInput = document.querySelector("#resize-height"); if (document.querySelector("#resize-lock").value === "yes") { const ratio = image.naturalWidth / image.naturalHeight; if (document.activeElement === widthInput) heightInput.value = Math.round(Number(widthInput.value) / ratio); if (document.activeElement === heightInput) widthInput.value = Math.round(Number(heightInput.value) * ratio); } const width = Number(widthInput.value); const height = Number(heightInput.value); canvas.width = width; canvas.height = height; canvas.getContext("2d").drawImage(image, 0, 0, width, height); return { blob: await canvasToBlob(canvas, "image/png"), filename: "resized.png" }; } }); }
  function renderCropImage() { renderCanvasImageTool({ buttonLabel: "Crop Gambar", extraFields: `<label class="tool-field"><span class="tool-label">X</span><input class="tool-input" id="crop-x" type="number" min="0" value="0"></label><label class="tool-field"><span class="tool-label">Y</span><input class="tool-input" id="crop-y" type="number" min="0" value="0"></label><label class="tool-field"><span class="tool-label">Lebar crop</span><input class="tool-input" id="crop-width" type="number" min="1"></label><label class="tool-field"><span class="tool-label">Tinggi crop</span><input class="tool-input" id="crop-height" type="number" min="1"></label>`, onLoaded(image) { document.querySelector("#crop-width").value = image.naturalWidth; document.querySelector("#crop-height").value = image.naturalHeight; }, onRun: async ({ image, canvas }) => { const x = Number(document.querySelector("#crop-x").value); const y = Number(document.querySelector("#crop-y").value); const width = Number(document.querySelector("#crop-width").value); const height = Number(document.querySelector("#crop-height").value); canvas.width = width; canvas.height = height; canvas.getContext("2d").drawImage(image, x, y, width, height, 0, 0, width, height); return { blob: await canvasToBlob(canvas, "image/png"), filename: "cropped.png" }; } }); }
  function renderRemoveBackground() {
    renderCanvasImageTool({
      buttonLabel: "Hapus Background",
      extraFields: `<label class="tool-field"><span class="tool-label">Toleransi warna</span><input class="tool-input" id="bg-tolerance" type="range" min="10" max="140" value="48"></label><label class="tool-field"><span class="tool-label">Feather halus</span><input class="tool-input" id="bg-feather" type="range" min="0" max="40" value="8"></label>`,
      onRun: async ({ image, canvas }) => {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0);
        const tolerance = Number(document.querySelector("#bg-tolerance").value);
        const feather = Number(document.querySelector("#bg-feather").value);
        removeBackgroundFromCanvas(canvas, { tolerance, feather });
        return { blob: await canvasToBlob(canvas, "image/png"), filename: "background-removed.png" };
      },
    });
  }
  function renderImageToTextOcr() {
    ui.workspace.innerHTML = createGenericFileShell({
      inputId: "ocr-file",
      listId: "ocr-list",
      label: "Pilih gambar untuk OCR",
      accept: "image/*",
      note: "Gunakan gambar dengan teks yang cukup jelas agar hasil OCR lebih akurat.",
      fields: `<label class="tool-field"><span class="tool-label">Bahasa OCR</span><select class="tool-select" id="ocr-lang"><option value="eng">English</option><option value="ind">Indonesia</option><option value="eng+ind">English + Indonesia</option></select></label>`,
      preview: true,
      previewText: "Preview gambar dan hasil OCR akan tampil di sini.",
      actions: `<button class="button button-primary" id="ocr-run" type="button">Ekstrak Teks</button><button class="button secondary-button" id="ocr-copy" type="button">Salin Hasil</button><button class="button secondary-button" id="ocr-download" type="button">Unduh TXT</button>`,
    });
    const input = document.querySelector("#ocr-file");
    const list = document.querySelector("#ocr-list");
    const preview = document.querySelector("#tool-preview");
    const progress = createProgressCard("Progress OCR");
    let latestText = "";
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      if (input.files[0]) showPreview(await loadImageFromFile(input.files[0]));
    });
    document.querySelector("#ocr-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih gambar terlebih dahulu.", "warn");
      try {
        setStatus("Menjalankan OCR, mohon tunggu...");
        const Tesseract = await ensureLibrary("tesseract");
        const imageUrl = URL.createObjectURL(file);
        const language = document.querySelector("#ocr-lang").value;
        const { data } = await Tesseract.recognize(imageUrl, language, {
          logger(message) {
            if (message.status === "recognizing text") progress.update((message.progress || 0) * 100, "Membaca teks dari gambar...");
            else if (message.progress != null) progress.update((message.progress || 0) * 100, message.status || "Memproses OCR...");
          },
        });
        URL.revokeObjectURL(imageUrl);
        latestText = (data.text || "").trim();
        preview.innerHTML = `<div class="result-card text-result-card"><h3>Hasil OCR</h3><pre class="text-file-preview">${escapeHtml(latestText || "Tidak ada teks yang berhasil dideteksi.")}</pre></div>`;
        progress.update(100, "OCR selesai.");
        setStatus(latestText ? "Teks berhasil diekstrak dari gambar." : "OCR selesai, tetapi belum menemukan teks yang jelas.", latestText ? "info" : "warn");
      } catch (error) {
        setStatus(error.message, "error");
      }
    });
    document.querySelector("#ocr-copy").addEventListener("click", async () => {
      if (!latestText) return setStatus("Belum ada hasil OCR untuk disalin.", "warn");
      await navigator.clipboard.writeText(latestText);
      setStatus("Hasil OCR berhasil disalin.");
    });
    document.querySelector("#ocr-download").addEventListener("click", () => {
      if (!latestText) return setStatus("Belum ada hasil OCR untuk diunduh.", "warn");
      downloadBlob(new Blob([latestText], { type: "text/plain;charset=utf-8" }), "ocr-result.txt");
      setStatus("File TXT hasil OCR berhasil diunduh.");
    });
  }
  function renderWatermarkImage() {
    renderCanvasImageTool({
      buttonLabel: "Tambahkan Watermark",
      extraFields: `<label class="tool-field full"><span class="tool-label">Teks watermark</span><input class="tool-input" id="watermark-text" type="text" value="CoreChiperTools"></label><label class="tool-field"><span class="tool-label">Posisi</span><select class="tool-select" id="watermark-position"><option value="bottom-right">Kanan bawah</option><option value="bottom-left">Kiri bawah</option><option value="top-right">Kanan atas</option><option value="top-left">Kiri atas</option><option value="center">Tengah</option></select></label><label class="tool-field"><span class="tool-label">Opacity</span><input class="tool-input" id="watermark-opacity" type="range" min="0.1" max="1" step="0.05" value="0.35"></label><label class="tool-field"><span class="tool-label">Ukuran font</span><input class="tool-input" id="watermark-size" type="number" min="12" max="160" value="36"></label><label class="tool-field"><span class="tool-label">Warna</span><input class="tool-input" id="watermark-color" type="color" value="#ffffff"></label>`,
      onRun: async ({ image, canvas }) => {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        drawTextWatermark(context, canvas, {
          text: document.querySelector("#watermark-text").value || "CoreChiperTools",
          position: document.querySelector("#watermark-position").value,
          opacity: Number(document.querySelector("#watermark-opacity").value),
          fontSize: Number(document.querySelector("#watermark-size").value),
          color: document.querySelector("#watermark-color").value,
        });
        return { blob: await canvasToBlob(canvas, "image/png"), filename: "watermarked.png" };
      },
    });
  }
  function renderEnhanceImage() {
    renderCanvasImageTool({
      buttonLabel: "Auto Improve",
      extraFields: `<label class="tool-field"><span class="tool-label">Strength</span><input class="tool-input" id="enhance-strength" type="range" min="0.2" max="1.8" step="0.1" value="1"></label><label class="tool-field"><span class="tool-label">Format output</span><select class="tool-select" id="enhance-format"><option value="image/jpeg">JPEG</option><option value="image/webp">WEBP</option><option value="image/png">PNG</option></select></label>`,
      onRun: async ({ image, canvas }) => {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        const strength = Number(document.querySelector("#enhance-strength").value);
        context.filter = `contrast(${1 + (0.18 * strength)}) saturate(${1 + (0.14 * strength)}) brightness(${1 + (0.05 * strength)})`;
        context.drawImage(image, 0, 0);
        context.filter = "none";
        applySharpen(canvas, 0.35 * strength);
        const format = document.querySelector("#enhance-format").value;
        return { blob: await canvasToBlob(canvas, format, 0.92), filename: `enhanced.${format.split("/")[1].replace("jpeg", "jpg")}` };
      },
    });
  }
  function renderBlurPixelateImage() {
    renderCanvasImageTool({
      buttonLabel: "Proses Gambar",
      extraFields: `<label class="tool-field"><span class="tool-label">Mode</span><select class="tool-select" id="blur-mode"><option value="blur">Blur</option><option value="pixelate">Pixelate</option></select></label><label class="tool-field"><span class="tool-label">Intensitas</span><input class="tool-input" id="blur-strength" type="range" min="4" max="80" value="18"></label>`,
      onRun: async ({ image, canvas }) => {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        const mode = document.querySelector("#blur-mode").value;
        const strength = Number(document.querySelector("#blur-strength").value);
        if (mode === "blur") {
          context.filter = `blur(${Math.max(1, strength / 3)}px)`;
          context.drawImage(image, 0, 0);
          context.filter = "none";
        } else {
          applyPixelateEffect(context, image, canvas.width, canvas.height, Math.max(2, strength));
        }
        return { blob: await canvasToBlob(canvas, "image/png"), filename: `${mode}.png` };
      },
    });
  }
  function renderConvertToWebp() {
    renderCanvasImageTool({
      buttonLabel: "Konversi ke WebP",
      extraFields: `<label class="tool-field"><span class="tool-label">Kualitas WebP</span><input class="tool-input" id="webp-quality" type="number" min="0.1" max="1" step="0.05" value="0.82"></label>`,
      onRun: async ({ image, canvas }) => {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext("2d").drawImage(image, 0, 0);
        return { blob: await canvasToBlob(canvas, "image/webp", Number(document.querySelector("#webp-quality").value)), filename: "converted.webp" };
      },
    });
  }

  function renderWordCounter() {
    ui.workspace.innerHTML = html`<label class="tool-field full"><span class="tool-label">Masukkan teks</span><textarea class="tool-textarea" id="word-counter-input" placeholder="Tempel artikel, caption, atau catatan Anda di sini..."></textarea></label><div class="stats-grid" id="word-counter-stats"></div>`;
    const input = document.querySelector("#word-counter-input");
    const stats = document.querySelector("#word-counter-stats");
    const update = () => {
      const value = input.value;
      const words = value.trim() ? value.trim().split(/\s+/).length : 0;
      const chars = value.length;
      const charsNoSpaces = value.replace(/\s/g, "").length;
      const lines = value ? value.split(/\n/).length : 0;
      const sentences = value.trim() ? value.split(/[.!?]+/).map((item) => item.trim()).filter(Boolean).length : 0;
      const paragraphs = value.trim() ? value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean).length : 0;
      const reading = words ? Math.max(1, Math.ceil(words / 200)) : 0;
      stats.innerHTML = [["Kata", words], ["Karakter", chars], ["Tanpa Spasi", charsNoSpaces], ["Kalimat", sentences], ["Paragraf", paragraphs], ["Baris", lines], ["Menit Baca", reading]].map(([label, number]) => `<div class="stat-chip"><strong>${formatNumber(number, 0)}</strong><span>${label}</span></div>`).join("");
    };
    input.addEventListener("input", update);
    update();
  }

  function renderRemoveSpaces() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">Teks sumber</span><textarea class="tool-textarea" id="space-input"></textarea></label><label class="tool-field"><span class="tool-label">Opsi 1</span><select class="tool-select" id="space-collapse"><option value="yes">Gabungkan spasi ganda</option><option value="no">Biarkan</option></select></label><label class="tool-field"><span class="tool-label">Opsi 2</span><select class="tool-select" id="space-empty"><option value="yes">Hapus baris kosong</option><option value="no">Biarkan</option></select></label><label class="tool-field full"><span class="tool-label">Hasil</span><textarea class="tool-textarea" id="space-output"></textarea></label></div><div class="action-row"><button class="button button-primary" id="space-run" type="button">Rapikan Teks</button><button class="button secondary-button" id="space-copy" type="button">Salin Hasil</button></div>`;
    document.querySelector("#space-run").addEventListener("click", () => {
      let text = document.querySelector("#space-input").value;
      text = text.split("\n").map((line) => line.trim()).join("\n");
      if (document.querySelector("#space-collapse").value === "yes") text = text.replace(/[ \t]+/g, " ");
      if (document.querySelector("#space-empty").value === "yes") text = text.split("\n").filter((line) => line.trim()).join("\n");
      document.querySelector("#space-output").value = text;
      setStatus("Teks berhasil dirapikan.");
    });
    document.querySelector("#space-copy").addEventListener("click", async () => {
      const value = document.querySelector("#space-output").value;
      if (!value) return setStatus("Belum ada hasil untuk disalin.", "warn");
      await navigator.clipboard.writeText(value);
      setStatus("Hasil berhasil disalin ke clipboard.");
    });
  }

  function renderCaseConverter() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">Masukkan teks</span><textarea class="tool-textarea" id="case-input" placeholder="Masukkan judul, paragraf, atau keyword yang ingin diubah case-nya..."></textarea></label><label class="tool-field"><span class="tool-label">Pilih mode</span><select class="tool-select" id="case-mode">${[["uppercase", "UPPERCASE"], ["lowercase", "lowercase"], ["title", "Title Case"], ["sentence", "Sentence case"], ["camel", "camelCase"], ["snake", "snake_case"], ["kebab", "kebab-case"]].map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}</select></label><label class="tool-field"><span class="tool-label">Aksi cepat</span><div class="action-row compact-actions"><button class="button button-primary" type="button" id="case-run">Konversi</button><button class="button secondary-button" type="button" id="case-copy">Salin Hasil</button></div></label><label class="tool-field full"><span class="tool-label">Hasil</span><textarea class="tool-textarea" id="case-output" placeholder="Hasil konversi akan muncul di sini..."></textarea></label></div><div class="tool-toolbar">${["uppercase", "lowercase", "title", "sentence", "camel", "snake", "kebab"].map((mode) => `<button class="button secondary-button" type="button" data-case="${mode}">${mode}</button>`).join("")}</div>`;
    const input = document.querySelector("#case-input");
    const mode = document.querySelector("#case-mode");
    const output = document.querySelector("#case-output");
    const apply = (selectedMode) => {
      output.value = convertCase(input.value, selectedMode);
      mode.value = selectedMode;
      setStatus(`Teks berhasil diubah ke mode ${selectedMode}.`);
    };
    document.querySelector("#case-run").addEventListener("click", () => apply(mode.value));
    document.querySelector("#case-copy").addEventListener("click", async () => {
      if (!output.value) return setStatus("Belum ada hasil untuk disalin.", "warn");
      await navigator.clipboard.writeText(output.value);
      setStatus("Hasil case conversion berhasil disalin.");
    });
    document.querySelectorAll("[data-case]").forEach((button) => {
      button.addEventListener("click", () => apply(button.dataset.case));
    });
  }

  function renderTextSorter() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">Masukkan daftar teks, satu item per baris</span><textarea class="tool-textarea" id="sort-input"></textarea></label><label class="tool-field"><span class="tool-label">Mode sortir</span><select class="tool-select" id="sort-mode"><option value="asc">A - Z</option><option value="desc">Z - A</option><option value="random">Acak</option></select></label><label class="tool-field"><span class="tool-label">Duplikat</span><select class="tool-select" id="sort-dedupe"><option value="no">Biarkan</option><option value="yes">Hapus duplikat</option></select></label><label class="tool-field full"><span class="tool-label">Hasil</span><textarea class="tool-textarea" id="sort-output"></textarea></label></div><div class="action-row"><button class="button button-primary" id="sort-run" type="button">Sort Teks</button></div>`;
    document.querySelector("#sort-run").addEventListener("click", () => {
      let lines = document.querySelector("#sort-input").value.split("\n").map((line) => line.trim()).filter(Boolean);
      if (document.querySelector("#sort-dedupe").value === "yes") lines = [...new Set(lines)];
      const mode = document.querySelector("#sort-mode").value;
      if (mode === "asc") lines.sort((a, b) => a.localeCompare(b));
      if (mode === "desc") lines.sort((a, b) => b.localeCompare(a));
      if (mode === "random") lines = lines.sort(() => Math.random() - 0.5);
      document.querySelector("#sort-output").value = lines.join("\n");
      setStatus("Teks berhasil diproses.");
    });
  }
  function renderRemoveDuplicateLines() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">Masukkan daftar baris</span><textarea class="tool-textarea" id="dedupe-input" placeholder="Satu item per baris..."></textarea></label><label class="tool-field"><span class="tool-label">Perbandingan huruf</span><select class="tool-select" id="dedupe-case"><option value="no">Tidak case sensitive</option><option value="yes">Case sensitive</option></select></label><label class="tool-field"><span class="tool-label">Baris kosong</span><select class="tool-select" id="dedupe-empty"><option value="skip">Lewati</option><option value="keep">Pertahankan</option></select></label><label class="tool-field full"><span class="tool-label">Hasil unik</span><textarea class="tool-textarea" id="dedupe-output"></textarea></label></div><div class="action-row"><button class="button button-primary" id="dedupe-run" type="button">Hapus Duplikat</button><button class="button secondary-button" id="dedupe-copy" type="button">Salin Hasil</button></div>`;
    document.querySelector("#dedupe-run").addEventListener("click", () => {
      const caseSensitive = document.querySelector("#dedupe-case").value === "yes";
      const keepEmpty = document.querySelector("#dedupe-empty").value === "keep";
      const seen = new Set();
      const result = [];
      document.querySelector("#dedupe-input").value.replace(/\r/g, "").split("\n").forEach((line) => {
        if (!keepEmpty && !line.trim()) return;
        const key = caseSensitive ? line : line.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        result.push(line);
      });
      document.querySelector("#dedupe-output").value = result.join("\n");
      setStatus("Baris duplikat berhasil dihapus.");
    });
    document.querySelector("#dedupe-copy").addEventListener("click", async () => {
      const value = document.querySelector("#dedupe-output").value;
      if (!value) return setStatus("Belum ada hasil untuk disalin.", "warn");
      await navigator.clipboard.writeText(value);
      setStatus("Hasil berhasil disalin.");
    });
  }
  function renderTextCompare() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Teks A</span><textarea class="tool-textarea" id="compare-left" placeholder="Tempel versi pertama di sini..."></textarea></label><label class="tool-field"><span class="tool-label">Teks B</span><textarea class="tool-textarea" id="compare-right" placeholder="Tempel versi kedua di sini..."></textarea></label></div><div class="action-row"><button class="button button-primary" id="compare-run" type="button">Bandingkan</button></div><div class="diff-grid" id="compare-output"><div class="result-card"><p class="small-note">Hasil diff akan tampil di sini setelah dibandingkan.</p></div></div>`;
    document.querySelector("#compare-run").addEventListener("click", () => {
      const left = document.querySelector("#compare-left").value.replace(/\r/g, "").split("\n");
      const right = document.querySelector("#compare-right").value.replace(/\r/g, "").split("\n");
      const diff = buildLineDiff(left, right);
      document.querySelector("#compare-output").innerHTML = `
        <div class="result-card diff-card"><h3>Versi A</h3>${renderDiffColumn(diff, "left")}</div>
        <div class="result-card diff-card"><h3>Versi B</h3>${renderDiffColumn(diff, "right")}</div>
      `;
      setStatus("Perbandingan teks selesai.");
    });
  }
  function renderJsonFormatter() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">JSON input</span><textarea class="tool-textarea" id="json-input" placeholder='{"name":"CoreChiperTools"}'></textarea></label><label class="tool-field"><span class="tool-label">Indentasi</span><select class="tool-select" id="json-indent"><option value="2">2 spasi</option><option value="4">4 spasi</option><option value="0">Minify</option></select></label><label class="tool-field"><span class="tool-label">Aksi</span><div class="action-row compact-actions"><button class="button button-primary" id="json-format" type="button">Format</button><button class="button secondary-button" id="json-validate" type="button">Validate</button><button class="button secondary-button" id="json-copy" type="button">Salin</button></div></label><label class="tool-field full"><span class="tool-label">Output</span><textarea class="tool-textarea" id="json-output"></textarea></label></div>`;
    const input = document.querySelector("#json-input");
    const output = document.querySelector("#json-output");
    const format = () => {
      const parsed = JSON.parse(input.value);
      const indent = Number(document.querySelector("#json-indent").value);
      output.value = indent ? JSON.stringify(parsed, null, indent) : JSON.stringify(parsed);
      return parsed;
    };
    document.querySelector("#json-format").addEventListener("click", () => {
      try {
        format();
        setStatus("JSON berhasil diformat.");
      } catch (error) {
        setStatus(`JSON tidak valid: ${error.message}`, "error");
      }
    });
    document.querySelector("#json-validate").addEventListener("click", () => {
      try {
        format();
        setStatus("JSON valid dan siap dipakai.");
      } catch (error) {
        setStatus(`JSON tidak valid: ${error.message}`, "error");
      }
    });
    document.querySelector("#json-copy").addEventListener("click", async () => {
      if (!output.value) return setStatus("Belum ada output JSON untuk disalin.", "warn");
      await navigator.clipboard.writeText(output.value);
      setStatus("Output JSON berhasil disalin.");
    });
  }

  function renderJpgToPng() { renderSpecialConvertTool("image/png", "converted.png", "Unggah file JPG untuk diubah ke PNG."); }

  function renderPngToJpg() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "png-jpg-file", listId: "png-jpg-list", label: "Pilih PNG", accept: ".png,image/png", note: "Area transparan akan diisi warna latar belakang." })}<label class="tool-field"><span class="tool-label">Warna latar</span><input class="tool-input" id="png-jpg-bg" type="color" value="#ffffff"></label><label class="tool-field"><span class="tool-label">Kualitas</span><input class="tool-input" id="png-jpg-quality" type="number" min="0.1" max="1" step="0.05" value="0.9"></label></div><div class="tool-preview" id="tool-preview"><p class="small-note">Preview hasil JPG akan muncul di sini.</p></div><div class="action-row"><button class="button button-primary" id="png-jpg-run" type="button">Konversi ke JPG</button></div>`;
    const input = document.querySelector("#png-jpg-file");
    const list = document.querySelector("#png-jpg-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#png-jpg-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PNG terlebih dahulu.", "warn");
      try {
        setStatus("Mengubah PNG ke JPG...");
        const image = await loadImageFromFile(file);
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        context.fillStyle = document.querySelector("#png-jpg-bg").value;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        showPreview(canvas);
        downloadBlob(await canvasToBlob(canvas, "image/jpeg", Number(document.querySelector("#png-jpg-quality").value)), "converted.jpg");
        setStatus("PNG berhasil diubah ke JPG.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderPdfToWord() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "pdf-word-file", listId: "pdf-word-list", label: "Pilih PDF", accept: ".pdf,application/pdf", note: "Tool ini lebih rapi untuk PDF berbasis teks digital dibanding PDF hasil scan gambar." })}</div><div class="tool-preview document-preview" id="tool-preview"><p class="small-note">Preview layout Word akan muncul di sini.</p></div><div class="action-row"><button class="button button-primary" id="pdf-word-run" type="button">Konversi ke DOC</button></div>`;
    const input = document.querySelector("#pdf-word-file");
    const list = document.querySelector("#pdf-word-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#pdf-word-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Mengubah PDF ke DOC...");
        const pages = await extractPdfStructured(file);
        const previewMarkup = pages.map((page, index) => `
          <section class="pdf-word-page">
            <div class="pdf-word-sheet" style="width:${page.width}px; min-height:${page.height}px;">
              ${page.lines.map((line) => `<p class="pdf-word-line" style="margin-left:${Math.max(0, line.left)}px; font-size:${Math.min(20, Math.max(11, line.fontSize))}px;">${escapeHtml(line.text)}</p>`).join("")}
            </div>
            <div class="pdf-word-page-label">Halaman ${index + 1}</div>
          </section>
        `).join("");
        showPreview(`<div id="pdf-word-render">${previewMarkup}</div>`);
        const htmlDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>CoreChiper PDF to Word</title><style>
          body{font-family:Calibri,Arial,sans-serif;background:#fff;color:#111;margin:0;padding:24px;}
          .pdf-word-page{page-break-after:always;margin:0 0 24px;}
          .pdf-word-page:last-child{page-break-after:auto;}
          .pdf-word-sheet{background:#fff;border:1px solid #ddd;padding:28px 24px;box-sizing:border-box;}
          .pdf-word-line{margin-top:0;margin-bottom:0.45em;white-space:pre-wrap;line-height:1.3;}
          .pdf-word-page-label{font-size:12px;color:#666;text-align:center;margin-top:8px;}
        </style></head><body>${previewMarkup}</body></html>`;
        downloadBlob(new Blob([htmlDoc], { type: "application/msword" }), "corechiper.doc");
        setStatus("File DOC berhasil dibuat dengan layout yang lebih terjaga.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderWordToPdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "word-pdf-file", listId: "word-pdf-list", label: "Pilih DOCX atau TXT", accept: ".docx,.txt,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document", note: "Dokumen akan dipreview lalu diekspor dari preview tersebut agar hasil PDF tidak kosong." })}</div><div class="tool-preview document-preview" id="tool-preview"><p class="small-note">Preview dokumen akan muncul di sini.</p></div><div class="action-row"><button class="button button-primary" id="word-pdf-run" type="button">Konversi ke PDF</button></div>`;
    const input = document.querySelector("#word-pdf-file");
    const list = document.querySelector("#word-pdf-list");
    const buildDocumentMarkup = async (file) => {
      const documentData = await extractWordDocument(file);
      return {
        html: `<div class="document-preview-sheet">${documentData.html}</div>`,
        text: documentData.text,
      };
    };
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#word-pdf-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file DOCX atau TXT terlebih dahulu.", "warn");
      try {
        setStatus("Menyiapkan preview dokumen...");
        const documentData = await buildDocumentMarkup(file);
        showPreview(`<div id="word-pdf-render" class="document-preview-frame">${documentData.html}</div>`);
        if (!documentData.text.trim()) {
          return setStatus("Isi dokumen tidak terbaca untuk diekspor. Coba simpan ulang file sebagai DOCX standar atau TXT.", "warn");
        }
        if (documentData.rich) {
          let exportTarget = null;
          try {
            exportTarget = createExportStage(documentData.html, "document-export-sheet rich-export-sheet");
            setStatus("Membuat PDF dengan layout yang lebih mirip Word...");
            const html2pdf = await ensureLibrary("html2pdf");
            await new Promise((resolve) => setTimeout(resolve, 180));
            await html2pdf().set({
              margin: [8, 8, 8, 8],
              filename: "corechiper-word-to-pdf.pdf",
              image: { type: "jpeg", quality: 0.98 },
              html2canvas: {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                windowWidth: 794,
                scrollX: 0,
                scrollY: 0,
              },
              jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
              pagebreak: { mode: ["css", "legacy"] },
            }).from(exportTarget).save();
            setStatus("Dokumen berhasil dikonversi ke PDF dengan format yang lebih mirip Word.");
          } catch (error) {
            setStatus("Mode layout penuh gagal, beralih ke mode teks aman...", "warn");
            await exportTextDocumentToPdf(documentData.text, "corechiper-word-to-pdf.pdf");
            setStatus("Dokumen berhasil dikonversi ke PDF lewat mode aman. Format bisa sedikit berbeda.");
          } finally {
            if (exportTarget) exportTarget.remove();
          }
        } else {
          setStatus("Membuat PDF dari isi dokumen...");
          await exportTextDocumentToPdf(documentData.text, "corechiper-word-to-pdf.pdf");
          setStatus("Dokumen berhasil dikonversi ke PDF dan tidak kosong.");
        }
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderPdfToJpg() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "pdf-jpg-file", listId: "pdf-jpg-list", label: "Pilih file PDF", accept: ".pdf,application/pdf", note: "Setiap halaman akan diekspor ke JPG dalam file ZIP." })}<label class="tool-field"><span class="tool-label">Skala render</span><input class="tool-input" id="pdf-jpg-scale" type="number" value="1.8" min="1" max="3" step="0.2"></label><label class="tool-field"><span class="tool-label">Kualitas JPG</span><input class="tool-input" id="pdf-jpg-quality" type="number" value="0.9" min="0.3" max="1" step="0.05"></label></div><div class="tool-preview" id="tool-preview"><p class="small-note">Preview halaman pertama akan tampil di sini.</p></div><div class="action-row"><button class="button button-primary" id="pdf-jpg-run" type="button">Konversi ke JPG</button></div>`;
    const input = document.querySelector("#pdf-jpg-file");
    const list = document.querySelector("#pdf-jpg-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#pdf-jpg-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Mengubah PDF ke JPG...");
        const JSZip = await ensureLibrary("jszip");
        const zip = new JSZip();
        let previewSet = false;
        await renderPdfPages(file, Number(document.querySelector("#pdf-jpg-scale").value), async (canvas, pageIndex) => {
          if (!previewSet) { previewSet = true; showPreview(canvas); }
          zip.file(`page-${pageIndex}.jpg`, await canvasToBlob(canvas, "image/jpeg", Number(document.querySelector("#pdf-jpg-quality").value)));
        });
        downloadBlob(await zip.generateAsync({ type: "blob" }), "corechiper-pdf-to-jpg.zip");
        setStatus("PDF berhasil dikonversi ke JPG.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderPdfToPng() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "pdf-png-file", listId: "pdf-png-list", label: "Pilih file PDF", accept: ".pdf,application/pdf", note: "Setiap halaman akan diekspor ke PNG dalam file ZIP." })}<label class="tool-field"><span class="tool-label">Skala render</span><input class="tool-input" id="pdf-png-scale" type="number" value="1.8" min="1" max="3" step="0.2"></label></div><div class="tool-preview" id="tool-preview"><p class="small-note">Preview halaman pertama akan tampil di sini.</p></div><div class="action-row"><button class="button button-primary" id="pdf-png-run" type="button">Konversi ke PNG</button></div>`;
    const input = document.querySelector("#pdf-png-file");
    const list = document.querySelector("#pdf-png-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#pdf-png-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Mengubah PDF ke PNG...");
        const JSZip = await ensureLibrary("jszip");
        const zip = new JSZip();
        let previewSet = false;
        await renderPdfPages(file, Number(document.querySelector("#pdf-png-scale").value), async (canvas, pageIndex) => {
          if (!previewSet) { previewSet = true; showPreview(canvas); }
          zip.file(`page-${pageIndex}.png`, await canvasToBlob(canvas, "image/png"));
        });
        downloadBlob(await zip.generateAsync({ type: "blob" }), "corechiper-pdf-to-png.zip");
        setStatus("PDF berhasil dikonversi ke PNG.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderJpgToPdf() { renderImageFilesToPdfShell({ title: "JPG", accept: ".jpg,.jpeg,image/jpeg", filename: "corechiper-jpg-to-pdf.pdf" }); }
  function renderPngToPdf() { renderImageFilesToPdfShell({ title: "PNG", accept: ".png,image/png", filename: "corechiper-png-to-pdf.pdf" }); }
  function renderImageToPdf() { renderImageFilesToPdfShell({ title: "gambar", accept: "image/*", filename: "corechiper-image-to-pdf.pdf" }); }
  function renderPdfToText() { renderConvertPdf(); }
  function renderImageToTextOcrConverter() { renderImageToTextOcr(); }
  function renderJpgToWebp() { renderSpecialConvertTool("image/webp", "converted.webp", "Unggah file JPG untuk diubah ke WebP."); }
  function renderPngToWebp() { renderSpecialConvertTool("image/webp", "converted.webp", "Unggah file PNG untuk diubah ke WebP."); }
  function renderWebpToPng() { renderSpecialConvertTool("image/png", "converted.png", "Unggah file WebP untuk diubah ke PNG.", ".webp,image/webp"); }

  function renderWebpToJpg() {
    renderCanvasImageTool({
      buttonLabel: "Konversi ke JPG",
      extraFields: `<label class="tool-field"><span class="tool-label">Warna latar</span><input class="tool-input" id="webp-jpg-bg" type="color" value="#ffffff"></label><label class="tool-field"><span class="tool-label">Kualitas</span><input class="tool-input" id="webp-jpg-quality" type="number" min="0.1" max="1" step="0.05" value="0.9"></label>`,
      onRun: async ({ image, canvas }) => {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        context.fillStyle = document.querySelector("#webp-jpg-bg").value;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        return { blob: await canvasToBlob(canvas, "image/jpeg", Number(document.querySelector("#webp-jpg-quality").value)), filename: "converted.jpg" };
      },
    });
  }

  function renderImageFilesToPdfShell(options) {
    ui.workspace.innerHTML = createGenericFileShell({
      inputId: "image-pdf-file",
      listId: "image-pdf-list",
      label: `Pilih file ${options.title}`,
      accept: options.accept,
      multiple: true,
      note: "Anda bisa memilih beberapa file sekaligus untuk digabungkan ke satu PDF.",
      preview: true,
      previewText: "Preview gambar pertama akan tampil di sini.",
      actions: `<button class="button button-primary" id="image-pdf-run" type="button">Konversi ke PDF</button>`,
    });
    const input = document.querySelector("#image-pdf-file");
    const list = document.querySelector("#image-pdf-list");
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      if (input.files[0]) showPreview(await loadImageFromFile(input.files[0]));
    });
    document.querySelector("#image-pdf-run").addEventListener("click", async () => {
      const files = [...input.files];
      if (!files.length) return setStatus("Pilih minimal satu file gambar terlebih dahulu.", "warn");
      try {
        setStatus("Menyusun gambar ke PDF...");
        await createPdfFromImageFiles(files, options.filename);
        setStatus("PDF berhasil dibuat dari gambar.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderPdfToHtml() {
    ui.workspace.innerHTML = createGenericFileShell({
      inputId: "pdf-html-file",
      listId: "pdf-html-list",
      label: "Pilih file PDF",
      accept: ".pdf,application/pdf",
      note: "Isi teks PDF akan dirender ke HTML sederhana.",
      preview: true,
      previewClass: "document-preview",
      previewText: "Preview HTML hasil konversi akan tampil di sini.",
      actions: `<button class="button button-primary" id="pdf-html-run" type="button">Konversi ke HTML</button><button class="button secondary-button" id="pdf-html-download" type="button">Unduh HTML</button>`,
    });
    const input = document.querySelector("#pdf-html-file");
    const list = document.querySelector("#pdf-html-list");
    let latestHtml = "";
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#pdf-html-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Mengubah PDF ke HTML...");
        const pages = await extractPdfStructured(file);
        latestHtml = `<article class="document-preview-sheet">${pages.map((page, index) => `<section><h2>Halaman ${index + 1}</h2>${page.lines.map((line) => `<p>${escapeHtml(line.text)}</p>`).join("")}</section>`).join("")}</article>`;
        showPreview(latestHtml);
        setStatus("HTML berhasil dibuat dari isi PDF.");
      } catch (error) { setStatus(error.message, "error"); }
    });
    document.querySelector("#pdf-html-download").addEventListener("click", () => {
      if (!latestHtml) return setStatus("Belum ada hasil HTML untuk diunduh.", "warn");
      downloadTextFile(`<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>PDF to HTML</title></head><body>${latestHtml}</body></html>`, "corechiper-pdf-to-html.html", "text/html;charset=utf-8");
      setStatus("File HTML berhasil diunduh.");
    });
  }

  function renderWordToTxt() {
    ui.workspace.innerHTML = createGenericFileShell({
      inputId: "word-txt-file",
      listId: "word-txt-list",
      label: "Pilih DOCX atau TXT",
      accept: ".docx,.txt,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      note: "Isi dokumen akan diekstrak sebagai teks polos.",
      preview: true,
      previewText: "Preview teks hasil ekstraksi akan tampil di sini.",
      actions: `<button class="button button-primary" id="word-txt-run" type="button">Ekstrak ke TXT</button><button class="button secondary-button" id="word-txt-download" type="button">Unduh TXT</button>`,
    });
    const input = document.querySelector("#word-txt-file");
    const list = document.querySelector("#word-txt-list");
    let latestText = "";
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#word-txt-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file Word terlebih dahulu.", "warn");
      try {
        const result = await extractWordDocument(file);
        latestText = result.text.trim();
        showPreview(`<div class="result-card text-result-card"><h3>Hasil Teks</h3><pre class="text-file-preview">${escapeHtml(latestText || "Tidak ada teks yang terdeteksi.")}</pre></div>`);
        setStatus(latestText ? "Isi Word berhasil diekstrak sebagai teks." : "Dokumen berhasil dibaca, tetapi teks kosong.", latestText ? "info" : "warn");
      } catch (error) { setStatus(error.message, "error"); }
    });
    document.querySelector("#word-txt-download").addEventListener("click", () => {
      if (!latestText) return setStatus("Belum ada hasil TXT untuk diunduh.", "warn");
      downloadTextFile(latestText, "corechiper-word-to-txt.txt");
      setStatus("File TXT berhasil diunduh.");
    });
  }

  function renderTxtToWord() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "txt-word-file", listId: "txt-word-list", label: "Pilih file TXT", accept: ".txt,text/plain", note: "Atau tempel teks langsung di area editor." })}<label class="tool-field full"><span class="tool-label">Isi teks</span><textarea class="tool-textarea" id="txt-word-input" placeholder="Masukkan teks yang ingin diubah menjadi dokumen Word..."></textarea></label></div><div class="tool-preview document-preview" id="tool-preview"><p class="small-note">Preview dokumen Word akan tampil di sini.</p></div><div class="action-row"><button class="button button-primary" id="txt-word-run" type="button">Konversi ke DOC</button></div>`;
    const input = document.querySelector("#txt-word-file");
    const list = document.querySelector("#txt-word-list");
    const textInput = document.querySelector("#txt-word-input");
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      if (input.files[0]) textInput.value = await readAsText(input.files[0]);
    });
    document.querySelector("#txt-word-run").addEventListener("click", () => {
      const text = textInput.value.trim();
      if (!text) return setStatus("Masukkan isi teks terlebih dahulu.", "warn");
      const previewMarkup = `<div class="document-preview-sheet">${text.split(/\n{2,}/).map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`).join("")}</div>`;
      showPreview(previewMarkup);
      const htmlDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>TXT to Word</title><style>body{font-family:Calibri,Arial,sans-serif;padding:28px;}p{line-height:1.5;margin:0 0 1em;}</style></head><body>${previewMarkup}</body></html>`;
      downloadBlob(new Blob([htmlDoc], { type: "application/msword" }), "corechiper-txt-to-word.doc");
      setStatus("Dokumen Word berhasil dibuat dari teks.");
    });
  }

  function renderHtmlToPdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "html-pdf-file", listId: "html-pdf-list", label: "Pilih file HTML", accept: ".html,.htm,text/html", note: "Anda juga bisa mengedit HTML langsung di bawah." })}<label class="tool-field full"><span class="tool-label">Isi HTML</span><textarea class="tool-textarea" id="html-pdf-input" placeholder="<h1>Judul</h1><p>Isi dokumen...</p>"></textarea></label></div><div class="tool-preview document-preview" id="tool-preview"><p class="small-note">Preview HTML akan tampil di sini.</p></div><div class="action-row"><button class="button button-primary" id="html-pdf-preview" type="button">Preview HTML</button><button class="button secondary-button" id="html-pdf-run" type="button">Konversi ke PDF</button></div>`;
    const input = document.querySelector("#html-pdf-file");
    const list = document.querySelector("#html-pdf-list");
    const htmlInput = document.querySelector("#html-pdf-input");
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      if (input.files[0]) htmlInput.value = await readFileAsHtml(input.files[0]);
    });
    document.querySelector("#html-pdf-preview").addEventListener("click", () => {
      if (!htmlInput.value.trim()) return setStatus("Masukkan isi HTML terlebih dahulu.", "warn");
      showPreview(`<div class="document-preview-sheet">${htmlInput.value}</div>`);
      setStatus("Preview HTML siap.");
    });
    document.querySelector("#html-pdf-run").addEventListener("click", async () => {
      if (!htmlInput.value.trim()) return setStatus("Masukkan isi HTML terlebih dahulu.", "warn");
      try {
        showPreview(`<div class="document-preview-sheet">${htmlInput.value}</div>`);
        await exportHtmlToPdfDocument(`<div class="document-preview-sheet">${htmlInput.value}</div>`, "corechiper-html-to-pdf.pdf");
        setStatus("HTML berhasil dikonversi ke PDF.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderHtmlToText() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "html-text-file", listId: "html-text-list", label: "Pilih file HTML", accept: ".html,.htm,text/html", note: "Tag HTML akan dibersihkan menjadi teks polos." })}<label class="tool-field full"><span class="tool-label">Isi HTML</span><textarea class="tool-textarea" id="html-text-input" placeholder="<p>Contoh isi HTML</p>"></textarea></label><label class="tool-field full"><span class="tool-label">Hasil teks</span><textarea class="tool-textarea" id="html-text-output"></textarea></label></div><div class="action-row"><button class="button button-primary" id="html-text-run" type="button">Konversi ke Text</button><button class="button secondary-button" id="html-text-download" type="button">Unduh TXT</button></div>`;
    const input = document.querySelector("#html-text-file");
    const list = document.querySelector("#html-text-list");
    const htmlInput = document.querySelector("#html-text-input");
    const output = document.querySelector("#html-text-output");
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      if (input.files[0]) htmlInput.value = await readFileAsHtml(input.files[0]);
    });
    document.querySelector("#html-text-run").addEventListener("click", () => {
      output.value = htmlToPlainText(htmlInput.value);
      setStatus(output.value ? "HTML berhasil diubah menjadi teks." : "Tidak ada teks yang ditemukan.", output.value ? "info" : "warn");
    });
    document.querySelector("#html-text-download").addEventListener("click", () => {
      if (!output.value.trim()) return setStatus("Belum ada hasil teks untuk diunduh.", "warn");
      downloadTextFile(output.value, "corechiper-html-to-text.txt");
      setStatus("File TXT berhasil diunduh.");
    });
  }

  function renderMarkdownToHtml() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "md-html-file", listId: "md-html-list", label: "Pilih file Markdown", accept: ".md,.markdown,text/markdown,text/plain", note: "Atau masukkan Markdown langsung di editor." })}<label class="tool-field full"><span class="tool-label">Isi Markdown</span><textarea class="tool-textarea" id="md-html-input" placeholder="# Judul&#10;&#10;- Item 1&#10;- Item 2"></textarea></label></div><div class="tool-preview document-preview" id="tool-preview"><p class="small-note">Preview HTML dari Markdown akan tampil di sini.</p></div><div class="action-row"><button class="button button-primary" id="md-html-run" type="button">Render ke HTML</button><button class="button secondary-button" id="md-html-download" type="button">Unduh HTML</button></div>`;
    const input = document.querySelector("#md-html-file");
    const list = document.querySelector("#md-html-list");
    const markdownInput = document.querySelector("#md-html-input");
    let latestHtml = "";
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      if (input.files[0]) markdownInput.value = await readAsText(input.files[0]);
    });
    document.querySelector("#md-html-run").addEventListener("click", async () => {
      if (!markdownInput.value.trim()) return setStatus("Masukkan Markdown terlebih dahulu.", "warn");
      try {
        latestHtml = await markdownToHtml(markdownInput.value);
        showPreview(`<div class="document-preview-sheet">${latestHtml}</div>`);
        setStatus("Markdown berhasil dirender ke HTML.");
      } catch (error) { setStatus(error.message, "error"); }
    });
    document.querySelector("#md-html-download").addEventListener("click", () => {
      if (!latestHtml) return setStatus("Belum ada HTML yang bisa diunduh.", "warn");
      downloadTextFile(`<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Markdown to HTML</title></head><body>${latestHtml}</body></html>`, "corechiper-markdown-to-html.html", "text/html;charset=utf-8");
      setStatus("File HTML berhasil diunduh.");
    });
  }

  function renderMarkdownToPdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "md-pdf-file", listId: "md-pdf-list", label: "Pilih file Markdown", accept: ".md,.markdown,text/markdown,text/plain", note: "Atau tulis Markdown langsung di editor." })}<label class="tool-field full"><span class="tool-label">Isi Markdown</span><textarea class="tool-textarea" id="md-pdf-input" placeholder="# Judul&#10;&#10;Paragraf isi dokumen."></textarea></label></div><div class="tool-preview document-preview" id="tool-preview"><p class="small-note">Preview hasil render akan tampil di sini.</p></div><div class="action-row"><button class="button button-primary" id="md-pdf-run" type="button">Konversi ke PDF</button></div>`;
    const input = document.querySelector("#md-pdf-file");
    const list = document.querySelector("#md-pdf-list");
    const markdownInput = document.querySelector("#md-pdf-input");
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      if (input.files[0]) markdownInput.value = await readAsText(input.files[0]);
    });
    document.querySelector("#md-pdf-run").addEventListener("click", async () => {
      if (!markdownInput.value.trim()) return setStatus("Masukkan Markdown terlebih dahulu.", "warn");
      try {
        const renderedHtml = await markdownToHtml(markdownInput.value);
        showPreview(`<div class="document-preview-sheet">${renderedHtml}</div>`);
        await exportHtmlToPdfDocument(`<div class="document-preview-sheet">${renderedHtml}</div>`, "corechiper-markdown-to-pdf.pdf");
        setStatus("Markdown berhasil dikonversi ke PDF.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderTextToPdf() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "text-pdf-file", listId: "text-pdf-list", label: "Pilih file TXT", accept: ".txt,text/plain", note: "Atau tempel teks langsung di area editor." })}<label class="tool-field full"><span class="tool-label">Isi teks</span><textarea class="tool-textarea" id="text-pdf-input" placeholder="Masukkan teks untuk diekspor ke PDF..."></textarea></label></div><div class="action-row"><button class="button button-primary" id="text-pdf-run" type="button">Konversi ke PDF</button></div>`;
    const input = document.querySelector("#text-pdf-file");
    const list = document.querySelector("#text-pdf-list");
    const textInput = document.querySelector("#text-pdf-input");
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      if (input.files[0]) textInput.value = await readAsText(input.files[0]);
    });
    document.querySelector("#text-pdf-run").addEventListener("click", async () => {
      if (!textInput.value.trim()) return setStatus("Masukkan teks terlebih dahulu.", "warn");
      try {
        await exportTextDocumentToPdf(textInput.value, "corechiper-text-to-pdf.pdf");
        setStatus("Teks berhasil dikonversi ke PDF.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderCsvToJson() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "csv-json-file", listId: "csv-json-list", label: "Pilih file CSV", accept: ".csv,text/csv,text/plain", note: "Atau tempel isi CSV langsung di area editor." })}<label class="tool-field full"><span class="tool-label">Isi CSV</span><textarea class="tool-textarea" id="csv-json-input" placeholder="name,email&#10;Dhafir,dhafir@example.com"></textarea></label><label class="tool-field full"><span class="tool-label">Hasil JSON</span><textarea class="tool-textarea" id="csv-json-output"></textarea></label></div><div class="action-row"><button class="button button-primary" id="csv-json-run" type="button">Konversi ke JSON</button><button class="button secondary-button" id="csv-json-download" type="button">Unduh JSON</button></div>`;
    const input = document.querySelector("#csv-json-file");
    const list = document.querySelector("#csv-json-list");
    const csvInput = document.querySelector("#csv-json-input");
    const output = document.querySelector("#csv-json-output");
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      if (input.files[0]) csvInput.value = await readAsText(input.files[0]);
    });
    document.querySelector("#csv-json-run").addEventListener("click", async () => {
      if (!csvInput.value.trim()) return setStatus("Masukkan isi CSV terlebih dahulu.", "warn");
      try {
        await ensureLibrary("xlsx");
        output.value = JSON.stringify(csvTextToJson(csvInput.value), null, 2);
        setStatus("CSV berhasil dikonversi ke JSON.");
      } catch (error) { setStatus(`Gagal mengubah CSV: ${error.message}`, "error"); }
    });
    document.querySelector("#csv-json-download").addEventListener("click", () => {
      if (!output.value.trim()) return setStatus("Belum ada hasil JSON untuk diunduh.", "warn");
      downloadTextFile(output.value, "corechiper-csv-to-json.json", "application/json;charset=utf-8");
      setStatus("File JSON berhasil diunduh.");
    });
  }

  function renderJsonToCsv() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "json-csv-file", listId: "json-csv-list", label: "Pilih file JSON", accept: ".json,application/json,text/plain", note: "JSON sebaiknya berupa object atau array of object." })}<label class="tool-field full"><span class="tool-label">Isi JSON</span><textarea class="tool-textarea" id="json-csv-input" placeholder='[{"name":"Dhafir","role":"Owner"}]'></textarea></label><label class="tool-field full"><span class="tool-label">Hasil CSV</span><textarea class="tool-textarea" id="json-csv-output"></textarea></label></div><div class="action-row"><button class="button button-primary" id="json-csv-run" type="button">Konversi ke CSV</button><button class="button secondary-button" id="json-csv-download" type="button">Unduh CSV</button></div>`;
    const input = document.querySelector("#json-csv-file");
    const list = document.querySelector("#json-csv-list");
    const jsonInput = document.querySelector("#json-csv-input");
    const output = document.querySelector("#json-csv-output");
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      if (input.files[0]) jsonInput.value = await readAsText(input.files[0]);
    });
    document.querySelector("#json-csv-run").addEventListener("click", async () => {
      if (!jsonInput.value.trim()) return setStatus("Masukkan isi JSON terlebih dahulu.", "warn");
      try {
        await ensureLibrary("xlsx");
        output.value = jsonToCsvText(jsonInput.value);
        setStatus("JSON berhasil dikonversi ke CSV.");
      } catch (error) { setStatus(`Gagal mengubah JSON: ${error.message}`, "error"); }
    });
    document.querySelector("#json-csv-download").addEventListener("click", () => {
      if (!output.value.trim()) return setStatus("Belum ada hasil CSV untuk diunduh.", "warn");
      downloadTextFile(output.value, "corechiper-json-to-csv.csv", "text/csv;charset=utf-8");
      setStatus("File CSV berhasil diunduh.");
    });
  }

  function renderPdfToExcel() {
    ui.workspace.innerHTML = createGenericFileShell({
      inputId: "pdf-excel-file",
      listId: "pdf-excel-list",
      label: "Pilih file PDF",
      accept: ".pdf,application/pdf",
      note: "Isi PDF akan disusun ke workbook Excel sederhana.",
      preview: true,
      previewText: "Ringkasan halaman akan tampil di sini.",
      actions: `<button class="button button-primary" id="pdf-excel-run" type="button">Konversi ke Excel</button>`,
    });
    const input = document.querySelector("#pdf-excel-file");
    const list = document.querySelector("#pdf-excel-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#pdf-excel-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Menyusun isi PDF ke workbook Excel...");
        const XLSX = await ensureLibrary("xlsx");
        const pages = await extractPdfStructured(file);
        const workbook = XLSX.utils.book_new();
        showPreview(`<div class="result-card"><h3>Ringkasan</h3><ul class="tool-list">${pages.map((page, index) => `<li>Halaman ${index + 1}: ${page.lines.length} baris teks</li>`).join("")}</ul></div>`);
        pages.forEach((page, index) => {
          const rows = page.lines.map((line) => ({ text: line.text, left: Math.round(line.left), fontSize: Math.round(line.fontSize) }));
          const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ text: "" }]);
          XLSX.utils.book_append_sheet(workbook, sheet, `Page${index + 1}`.slice(0, 31));
        });
        XLSX.writeFile(workbook, "corechiper-pdf-to-excel.xlsx");
        setStatus("Workbook Excel berhasil dibuat dari PDF.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderExcelToPdf() {
    ui.workspace.innerHTML = createGenericFileShell({
      inputId: "excel-pdf-file",
      listId: "excel-pdf-list",
      label: "Pilih file Excel atau CSV",
      accept: ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv",
      note: "Sheet pertama akan dirender jadi tabel HTML sebelum diekspor ke PDF.",
      preview: true,
      previewClass: "document-preview",
      previewText: "Preview tabel akan tampil di sini.",
      actions: `<button class="button button-primary" id="excel-pdf-run" type="button">Konversi ke PDF</button>`,
    });
    const input = document.querySelector("#excel-pdf-file");
    const list = document.querySelector("#excel-pdf-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#excel-pdf-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file Excel terlebih dahulu.", "warn");
      try {
        const XLSX = await ensureLibrary("xlsx");
        const workbook = XLSX.read(await readAsArrayBuffer(file), { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        const htmlTable = `<div class="document-preview-sheet"><table class="result-table">${rows.map((row, rowIndex) => `<tr>${row.map((cell) => rowIndex === 0 ? `<th>${escapeHtml(String(cell))}</th>` : `<td>${escapeHtml(String(cell))}</td>`).join("")}</tr>`).join("")}</table></div>`;
        showPreview(htmlTable);
        await exportHtmlToPdfDocument(htmlTable, "corechiper-excel-to-pdf.pdf");
        setStatus("Excel berhasil dikonversi ke PDF.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderPdfToPpt() {
    ui.workspace.innerHTML = createGenericFileShell({
      inputId: "pdf-ppt-file",
      listId: "pdf-ppt-list",
      label: "Pilih file PDF",
      accept: ".pdf,application/pdf",
      note: "Setiap halaman PDF akan dijadikan satu slide bergambar.",
      fields: `<label class="tool-field"><span class="tool-label">Skala render</span><input class="tool-input" id="pdf-ppt-scale" type="number" value="1.8" min="1" max="3" step="0.2"></label>`,
      preview: true,
      previewText: "Preview halaman pertama akan tampil di sini.",
      actions: `<button class="button button-primary" id="pdf-ppt-run" type="button">Konversi ke PPTX</button>`,
    });
    const input = document.querySelector("#pdf-ppt-file");
    const list = document.querySelector("#pdf-ppt-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#pdf-ppt-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      try {
        setStatus("Membuat slide dari halaman PDF...");
        const PptxGenJS = await ensureLibrary("pptxgenjs");
        const pptx = new PptxGenJS();
        pptx.layout = "LAYOUT_WIDE";
        let previewSet = false;
        await renderPdfPages(file, Number(document.querySelector("#pdf-ppt-scale").value), async (canvas) => {
          if (!previewSet) { previewSet = true; showPreview(canvas); }
          const slide = pptx.addSlide();
          slide.background = { color: "FFFFFF" };
          slide.addImage({ data: canvas.toDataURL("image/png"), x: 0, y: 0, w: 13.333, h: 7.5 });
        });
        await pptx.writeFile({ fileName: "corechiper-pdf-to-ppt.pptx" });
        setStatus("PPTX berhasil dibuat dari PDF.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderPptToPdf() {
    ui.workspace.innerHTML = createGenericFileShell({
      inputId: "ppt-pdf-file",
      listId: "ppt-pdf-list",
      label: "Pilih file PPTX",
      accept: ".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation",
      note: "Isi teks slide akan diringkas lalu diekspor ke PDF.",
      preview: true,
      previewClass: "document-preview",
      previewText: "Preview isi slide akan tampil di sini.",
      actions: `<button class="button button-primary" id="ppt-pdf-run" type="button">Konversi ke PDF</button>`,
    });
    const input = document.querySelector("#ppt-pdf-file");
    const list = document.querySelector("#ppt-pdf-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#ppt-pdf-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file PPTX terlebih dahulu.", "warn");
      try {
        const slides = await extractPptxSlides(file);
        const htmlSlides = `<div class="document-preview-sheet">${slides.map((slide) => `<section><h2>${escapeHtml(slide.title)}</h2><pre class="text-file-preview">${escapeHtml(slide.text || "(slide kosong)")}</pre></section>`).join("")}</div>`;
        showPreview(htmlSlides);
        await exportHtmlToPdfDocument(htmlSlides, "corechiper-ppt-to-pdf.pdf");
        setStatus(slides.length ? "PPTX berhasil dikonversi ke PDF." : "File PPTX berhasil dibaca tetapi tidak ada teks slide yang ditemukan.", slides.length ? "info" : "warn");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderDeletePdf() {
    ui.workspace.innerHTML = html`
      <div class="tool-form-grid">
        ${inputFileTemplate({ id: "delete-pdf-file", listId: "delete-pdf-list", label: "Pilih file PDF", accept: ".pdf,application/pdf", note: "Unggah PDF lalu pilih halaman yang ingin dihapus." })}
        <label class="tool-field full">
          <span class="tool-label">Hapus cepat berdasarkan nomor halaman</span>
          <input class="tool-input" id="delete-pdf-range" type="text" placeholder="Contoh: 2,5-7">
        </label>
      </div>
      <div class="result-card">
        <h3>Ringkasan</h3>
        <div id="delete-pdf-summary" class="small-note">Belum ada file PDF yang dipilih.</div>
      </div>
      <div id="delete-pdf-pages" class="pdf-delete-grid">
        <div class="result-card"><p class="small-note">Preview halaman akan tampil di sini setelah PDF dibuka.</p></div>
      </div>
      <div class="action-row">
        <button class="button button-primary" id="delete-pdf-export" type="button">Hapus Halaman & Ekspor PDF</button>
        <button class="button secondary-button" id="delete-pdf-select-range" type="button">Terapkan Range Hapus</button>
        <button class="button secondary-button" id="delete-pdf-reset" type="button">Reset Pilihan</button>
      </div>
    `;

    const input = document.querySelector("#delete-pdf-file");
    const list = document.querySelector("#delete-pdf-list");
    const summary = document.querySelector("#delete-pdf-summary");
    const pagesHost = document.querySelector("#delete-pdf-pages");
    const rangeInput = document.querySelector("#delete-pdf-range");
    const state = { file: null, totalPages: 0, removedPages: new Set(), pageCards: [] };

    const syncSummary = () => {
      if (!state.totalPages) {
        summary.textContent = "Belum ada file PDF yang dipilih.";
        return;
      }
      const removed = [...state.removedPages].sort((a, b) => a - b);
      summary.innerHTML = `
        <strong>${escapeHtml(state.file?.name || "PDF")}</strong><br>
        Total halaman: ${state.totalPages} | Akan dihapus: ${removed.length} | Tersisa: ${state.totalPages - removed.length}<br>
        ${removed.length ? `Halaman dihapus: ${removed.join(", ")}` : "Belum ada halaman yang ditandai untuk dihapus."}
      `;
    };

    const syncCards = () => {
      state.pageCards.forEach(({ pageNumber, checkbox, card }) => {
        const checked = state.removedPages.has(pageNumber);
        checkbox.checked = checked;
        card.classList.toggle("is-selected", checked);
      });
      syncSummary();
    };

    input.addEventListener("change", async () => {
      const file = input.files[0];
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      state.file = file || null;
      state.totalPages = 0;
      state.removedPages = new Set();
      state.pageCards = [];
      pagesHost.innerHTML = `<div class="result-card"><p class="small-note">Menyiapkan preview halaman PDF...</p></div>`;
      syncSummary();
      if (!file) return;
      try {
        setStatus("Membaca halaman PDF untuk mode hapus halaman...");
        const pdfjsLib = await ensureLibrary("pdfjs");
        const pdf = await pdfjsLib.getDocument({ data: await readAsArrayBuffer(file) }).promise;
        state.totalPages = pdf.numPages;
        pagesHost.innerHTML = "";
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 0.42 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
          const card = document.createElement("label");
          card.className = "pdf-delete-card";
          card.innerHTML = `
            <div class="pdf-delete-check">
              <input type="checkbox">
              <span>Hapus halaman ${pageNumber}</span>
            </div>
            <div class="pdf-delete-thumb"></div>
            <div class="small-note">Klik centang untuk membuang halaman ini dari hasil akhir.</div>
          `;
          card.querySelector(".pdf-delete-thumb").appendChild(canvas);
          const checkbox = card.querySelector("input");
          checkbox.addEventListener("change", () => {
            if (checkbox.checked) state.removedPages.add(pageNumber);
            else state.removedPages.delete(pageNumber);
            syncCards();
          });
          pagesHost.appendChild(card);
          state.pageCards.push({ pageNumber, checkbox, card });
        }
        syncCards();
        setStatus(`PDF siap diedit. Pilih halaman yang ingin dihapus dari ${pdf.numPages} halaman.`);
      } catch (error) {
        pagesHost.innerHTML = `<div class="result-card"><p class="small-note">Preview gagal dibuat.</p></div>`;
        setStatus(error.message, "error");
      }
    });

    document.querySelector("#delete-pdf-select-range").addEventListener("click", () => {
      if (!state.totalPages) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      if (!rangeInput.value.trim()) return setStatus("Masukkan nomor halaman atau rentang yang ingin dihapus.", "warn");
      try {
        parseRanges(rangeInput.value, state.totalPages).flat().forEach((pageNumber) => state.removedPages.add(pageNumber));
        syncCards();
        setStatus("Range halaman berhasil ditandai untuk dihapus.");
      } catch (error) {
        setStatus(error.message, "error");
      }
    });

    document.querySelector("#delete-pdf-reset").addEventListener("click", () => {
      state.removedPages.clear();
      rangeInput.value = "";
      syncCards();
      setStatus("Pilihan hapus halaman berhasil direset.");
    });

    document.querySelector("#delete-pdf-export").addEventListener("click", async () => {
      if (!state.file) return setStatus("Pilih file PDF terlebih dahulu.", "warn");
      if (!state.removedPages.size) return setStatus("Pilih minimal satu halaman untuk dihapus.", "warn");
      if (state.removedPages.size >= state.totalPages) return setStatus("Minimal satu halaman harus tetap dipertahankan.", "warn");
      try {
        setStatus("Menghapus halaman yang dipilih dan menyiapkan PDF baru...");
        const { PDFDocument } = await ensureLibrary("pdfLib");
        const sourcePdf = await PDFDocument.load(await readAsArrayBuffer(state.file));
        const targetPdf = await PDFDocument.create();
        const keepIndexes = Array.from({ length: sourcePdf.getPageCount() }, (_, index) => index).filter((index) => !state.removedPages.has(index + 1));
        const pages = await targetPdf.copyPages(sourcePdf, keepIndexes);
        pages.forEach((page) => targetPdf.addPage(page));
        const filename = state.file.name.replace(/\.pdf$/i, "") || "corechiper";
        downloadBlob(new Blob([await targetPdf.save()], { type: "application/pdf" }), `${filename}-deleted-pages.pdf`);
        setStatus(`PDF baru berhasil dibuat dengan ${keepIndexes.length} halaman tersisa.`);
      } catch (error) {
        setStatus(error.message, "error");
      }
    });
  }

  function renderAutoChartMaker() {
    ui.workspace.innerHTML = html`
      <div class="tool-form-grid">
        ${inputFileTemplate({ id: "chart-source-file", listId: "chart-source-list", label: "Upload Excel / TXT / PDF", accept: ".xlsx,.xls,.csv,.txt,.pdf,application/pdf,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel", note: "Bisa dari Excel, CSV, TXT, PDF, atau ketik data langsung di editor." })}
        <label class="tool-field">
          <span class="tool-label">Format parsing manual</span>
          <select class="tool-select" id="chart-manual-format">
            <option value="auto">Otomatis</option>
            <option value="csv">CSV koma</option>
            <option value="tsv">TSV tab</option>
            <option value="pipe">Pipe |</option>
            <option value="semicolon">Semicolon ;</option>
            <option value="colon">Label: Nilai</option>
          </select>
        </label>
        <label class="tool-field">
          <span class="tool-label">Chart saat dataset cocok</span>
          <select class="tool-select" id="chart-type-select">
            <option value="auto">Auto terbaik</option>
            <option value="bar">Bar</option>
            <option value="horizontal-bar">Horizontal Bar</option>
            <option value="line">Line</option>
            <option value="area">Area</option>
            <option value="pie">Pie</option>
            <option value="donut">Donut</option>
            <option value="radar">Radar</option>
            <option value="scatter">Scatter</option>
            <option value="bubble">Bubble</option>
            <option value="stacked-bar">Stacked Bar</option>
          </select>
        </label>
        <label class="tool-field">
          <span class="tool-label">Mode gabung series</span>
          <select class="tool-select" id="chart-series-layout">
            <option value="single">Selalu 1 chart gabungan</option>
            <option value="auto">Pisah otomatis jika beda skala</option>
            <option value="merged">Gabungkan jika masih aman</option>
            <option value="split">Selalu pisah per grup</option>
          </select>
        </label>
        <label class="tool-field">
          <span class="tool-label">Mode export multi chart</span>
          <select class="tool-select" id="chart-export-mode">
            <option value="combined">Gabung jadi 1 gambar / file</option>
            <option value="zip">Pisah per chart lalu ZIP</option>
          </select>
        </label>
        <label class="tool-field">
          <span class="tool-label">Judul chart</span>
          <input class="tool-input" id="chart-title-input" type="text" value="Auto Chart Insight">
        </label>
        <label class="tool-field">
          <span class="tool-label">Subjudul / catatan</span>
          <input class="tool-input" id="chart-subtitle-input" type="text" value="">
        </label>
        <label class="tool-field full">
          <span class="tool-label">Data editor</span>
          <textarea class="tool-textarea" id="chart-data-input" placeholder="Contoh CSV:&#10;Bulan,Penjualan,Biaya&#10;Jan,120,80&#10;Feb,140,90&#10;Mar,180,120"></textarea>
        </label>
      </div>
      <div class="stats-grid" id="chart-stats">
        <div class="stat-chip"><strong>-</strong><span>Baris data</span></div>
        <div class="stat-chip"><strong>-</strong><span>Kolom</span></div>
        <div class="stat-chip"><strong>-</strong><span>Rekomendasi</span></div>
        <div class="stat-chip"><strong>-</strong><span>Status</span></div>
      </div>
      <div class="result-card" id="chart-insight-card">
        <h3>Saran Chart</h3>
        <p class="small-note" id="chart-insight-text">Masukkan data dulu untuk melihat chart terbaik.</p>
        <div id="chart-summary-panel" class="tool-stack"></div>
      </div>
      <div class="tool-preview chart-preview-shell" id="tool-preview">
        <p class="small-note">Preview chart akan tampil di sini setelah data diproses.</p>
      </div>
      <div class="result-card" id="chart-table-card">
        <h3>Dataset Terdeteksi</h3>
        <div class="small-note">Belum ada dataset yang siap divisualisasikan.</div>
      </div>
      <div class="action-row">
        <button class="button button-primary" id="chart-generate" type="button">Analisis & Buat Chart</button>
        <button class="button secondary-button" id="chart-export-pdf" type="button">Export PDF</button>
        <button class="button secondary-button" id="chart-export-png" type="button">Export PNG</button>
        <button class="button secondary-button" id="chart-export-jpg" type="button">Export JPG</button>
        <button class="button secondary-button" id="chart-export-webp" type="button">Export WEBP</button>
      </div>
    `;

    const input = document.querySelector("#chart-source-file");
    const list = document.querySelector("#chart-source-list");
    const dataInput = document.querySelector("#chart-data-input");
    const formatInput = document.querySelector("#chart-manual-format");
    const chartTypeInput = document.querySelector("#chart-type-select");
    const seriesLayoutInput = document.querySelector("#chart-series-layout");
    const exportModeInput = document.querySelector("#chart-export-mode");
    const titleInput = document.querySelector("#chart-title-input");
    const subtitleInput = document.querySelector("#chart-subtitle-input");
    const statsHost = document.querySelector("#chart-stats");
    const insightText = document.querySelector("#chart-insight-text");
    const summaryPanel = document.querySelector("#chart-summary-panel");
    const tableCard = document.querySelector("#chart-table-card");
    const state = { parsed: null, recommendation: null, canvas: null, displayParsed: null, charts: [], warnings: [] };

    const updateStats = (parsed, recommendation, statusLabel) => {
      const cards = [...statsHost.querySelectorAll(".stat-chip strong")];
      cards[0].textContent = parsed ? String(parsed.dataRows.length) : "-";
      cards[1].textContent = parsed ? String(parsed.headers.length) : "-";
      cards[2].textContent = recommendation ? recommendation.label : "-";
      cards[3].textContent = statusLabel || "-";
    };

    const renderDataTable = (parsed, note = "") => {
      if (!parsed) {
        tableCard.innerHTML = `<h3>Dataset Terdeteksi</h3><div class="small-note">Belum ada dataset yang siap divisualisasikan.</div>`;
        return;
      }
      const previewRows = parsed.rows.slice(0, 8);
      const headerTypes = parsed.columnTypes || [];
      const warnings = parsed.warnings || [];
      tableCard.innerHTML = `
        <h3>Dataset Terdeteksi</h3>
        <div class="chart-table-scroll">
          <table class="result-table chart-table">
            <thead><tr>${parsed.headers.map((header, index) => `<th>${escapeHtml(String(header))}${headerTypes[index] ? `<div class="chart-col-badge">${escapeHtml(headerTypes[index])}</div>` : ""}</th>`).join("")}</tr></thead>
            <tbody>${previewRows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>
        <p class="small-note">${parsed.rows.length > previewRows.length ? `Menampilkan ${previewRows.length} dari ${parsed.rows.length} baris.` : "Semua baris ditampilkan."}${note ? ` ${escapeHtml(note)}` : ""}</p>
        ${warnings.length ? `<div class="small-note" style="color:#b45309;">${escapeHtml(parsed.validationMessage || "Data tidak terstruktur dengan baik")} ${warnings.map((item) => escapeHtml(item)).join(" ")}</div>` : ""}
      `;
    };

    const renderChart = () => {
      if (!state.parsed || !state.recommendation) return;
      const selectedType = chartTypeInput.value === "auto" ? "auto" : chartTypeInput.value;
      const smartPreview = buildSmartChartPreview(state.parsed, selectedType, {
        title: titleInput.value.trim() || "Auto Chart Insight",
        subtitle: subtitleInput.value.trim(),
        seriesLayout: seriesLayoutInput.value,
      });
      if (!smartPreview) return setStatus("Dataset belum cocok untuk divisualisasikan. Coba rapikan format data.", "warn");
      showPreview(smartPreview.previewNode);
      state.canvas = smartPreview.exportCanvas;
      state.displayParsed = smartPreview.displayParsed || state.parsed;
      state.charts = smartPreview.charts || [];
      renderDataTable(state.displayParsed, smartPreview.tableNote || "");
      renderInsightSummary(smartPreview.smartModel || null, state.warnings);
      updateStats(state.parsed, state.recommendation, smartPreview.typeLabel);
      if (state.warnings.length) {
        setStatus(`${state.parsed.validationMessage || "Data tidak terstruktur dengan baik"}. ${state.warnings.join(" ")}`, "warn");
      } else {
        setStatus(`${smartPreview.statusLabel} berhasil dibuat dan siap diekspor.`);
      }
    };

    const analyzeAndRender = async () => {
      try {
        const parsed = parseChartDataset(dataInput.value, formatInput.value);
        if (!parsed) return setStatus("Data belum bisa dipahami. Gunakan tabel dengan header atau format Label: Nilai.", "warn");
        const recommendation = recommendChartType(parsed);
        state.parsed = parsed;
        state.recommendation = recommendation;
        state.displayParsed = parsed;
        state.warnings = parsed.warnings || [];
        const smartExplanation = summarizeSmartChartPlan(parsed);
        const baseInsight = smartExplanation || `${recommendation.label} dipilih karena ${recommendation.reason}. Anda tetap bisa mengganti tipe chart secara manual.`;
        insightText.textContent = state.warnings.length
          ? `${parsed.validationMessage || "Data tidak terstruktur dengan baik"}. ${state.warnings.join(" ")} ${baseInsight}`
          : baseInsight;
        renderChart();
      } catch (error) {
        setStatus(error.message, "error");
        updateStats(null, null, "Error");
      }
    };

    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      const file = input.files[0];
      if (!file) return;
      try {
        setStatus("Membaca data sumber untuk chart...");
        const fileName = file.name.toLowerCase();
        if (fileName.endsWith(".pdf")) {
          const structured = await extractPdfStructured(file);
          dataInput.value = structured.map((page) => page.lines.map((line) => line.text).join("\n")).join("\n");
        } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".csv")) {
          const XLSX = await ensureLibrary("xlsx");
          const workbook = XLSX.read(await readAsArrayBuffer(file), { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
          dataInput.value = rows.map((row) => row.join(",")).join("\n");
        } else {
          dataInput.value = await readAsText(file);
        }
        await analyzeAndRender();
      } catch (error) {
        setStatus(error.message, "error");
      }
    });

    document.querySelector("#chart-generate").addEventListener("click", analyzeAndRender);
    chartTypeInput.addEventListener("change", renderChart);
    seriesLayoutInput.addEventListener("change", renderChart);
    titleInput.addEventListener("input", renderChart);
    subtitleInput.addEventListener("input", renderChart);

    const exportCurrentChart = async (format) => {
      if (!state.canvas) return setStatus("Buat chart dulu sebelum export.", "warn");
      const safeName = slugify(titleInput.value || "auto-chart") || "auto-chart";
      if ((state.charts || []).length > 1 && exportModeInput.value === "zip") {
        await exportChartCollection(state.charts, format, safeName);
        return;
      }
      if (format === "pdf") {
        const { jsPDF } = (await ensureLibrary("jspdf")).jsPDF ? (await ensureLibrary("jspdf")) : window.jspdf;
        const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const ratio = Math.min((pageWidth - margin * 2) / state.canvas.width, (pageHeight - margin * 2) / state.canvas.height);
        const width = state.canvas.width * ratio;
        const height = state.canvas.height * ratio;
        pdf.addImage(state.canvas.toDataURL("image/png"), "PNG", (pageWidth - width) / 2, (pageHeight - height) / 2, width, height);
        pdf.save(`${safeName}.pdf`);
        setStatus("Chart berhasil diekspor ke PDF.");
        return;
      }
      const mime = format === "png" ? "image/png" : format === "jpg" ? "image/jpeg" : "image/webp";
      const blob = await canvasToBlob(state.canvas, mime, format === "png" ? undefined : 0.94);
      downloadBlob(blob, `${safeName}.${format}`);
      setStatus(`Chart berhasil diekspor ke ${format.toUpperCase()}.`);
    };

    const renderInsightSummary = (smartModel, warnings = []) => {
      if (!smartModel && !warnings.length) {
        summaryPanel.innerHTML = "";
        return;
      }
      const warningCard = warnings.length ? `
        <div class="result-card chart-summary-card">
          <h4>Warning</h4>
          <ul class="tool-list"><li>${escapeHtml(state.parsed?.validationMessage || "Data tidak terstruktur dengan baik")}</li>${warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
      ` : "";
      if (!smartModel) {
        summaryPanel.innerHTML = warningCard;
        return;
      }
      const globalSummary = buildGlobalSummary(smartModel);
      const metricInsights = buildMetricInsights(smartModel);
      const anomalies = detectAnomalies(smartModel);
      summaryPanel.innerHTML = `
        ${warningCard}
        <div class="result-card chart-summary-card">
          <h4>Summary Global</h4>
          <ul class="tool-list">${globalSummary.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <div class="result-card chart-summary-card">
          <h4>Insight Otomatis</h4>
          <ul class="tool-list">${metricInsights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
        <div class="result-card chart-summary-card">
          <h4>Anomali</h4>
          <ul class="tool-list">${(anomalies.length ? anomalies : ["Belum ada anomali besar yang terdeteksi."]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
      `;
    };

    const exportChartCollection = async (charts, format, safeName) => {
      if (charts.length === 1) return;
      const JSZip = await ensureLibrary("jszip");
      const zip = new JSZip();
      if (format === "pdf") {
        const { jsPDF } = (await ensureLibrary("jspdf")).jsPDF ? (await ensureLibrary("jspdf")) : window.jspdf;
        for (const chart of charts) {
          const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const margin = 10;
          const ratio = Math.min((pageWidth - margin * 2) / chart.canvas.width, (pageHeight - margin * 2) / chart.canvas.height);
          const width = chart.canvas.width * ratio;
          const height = chart.canvas.height * ratio;
          pdf.addImage(chart.canvas.toDataURL("image/png"), "PNG", (pageWidth - width) / 2, (pageHeight - height) / 2, width, height);
          zip.file(`${chart.filename}.pdf`, pdf.output("arraybuffer"));
        }
      } else {
        const mime = format === "png" ? "image/png" : format === "jpg" ? "image/jpeg" : "image/webp";
        for (const chart of charts) {
          const blob = await canvasToBlob(chart.canvas, mime, format === "png" ? undefined : 0.94);
          zip.file(`${chart.filename}.${format}`, blob);
        }
      }
      downloadBlob(await zip.generateAsync({ type: "blob" }), `${safeName}-${format}-charts.zip`);
      setStatus(`Semua chart berhasil diekspor sebagai ZIP ${format.toUpperCase()}.`);
    };

    document.querySelector("#chart-export-pdf").addEventListener("click", () => exportCurrentChart("pdf"));
    document.querySelector("#chart-export-png").addEventListener("click", () => exportCurrentChart("png"));
    document.querySelector("#chart-export-jpg").addEventListener("click", () => exportCurrentChart("jpg"));
    document.querySelector("#chart-export-webp").addEventListener("click", () => exportCurrentChart("webp"));
  }

  function parseChartDataset(rawText, format = "auto") {
    const value = String(rawText || "").replace(/\r/g, "").trim();
    if (!value) return null;
    const structuredRows = format === "auto" ? parseEntityTimeChartRows(value) : null;
    if (structuredRows) return structuredRows;
    let rows = [];
    if (format === "colon") rows = parseColonChartRows(value);
    else rows = parseDelimitedChartRows(value, format);
    if (!rows.length) return null;
    const rawRows = rows
      .map((row) => row.map((cell) => String(cell ?? "").trim()))
      .filter((row) => row.some((cell) => cell !== ""));
    const normalizedRows = rows
      .map((row) => row.map((cell) => normalizeChartCell(cell)))
      .filter((row) => row.some((cell) => String(cell).trim() !== ""));
    if (normalizedRows.length < 2) throw new Error("Minimal butuh header dan satu baris data untuk membuat chart.");
    const targetWidth = Math.max(...normalizedRows.map((row) => row.length));
    const paddedRows = normalizedRows.map((row) => [...row, ...Array.from({ length: targetWidth - row.length }, () => "")]);
    const paddedRawRows = rawRows.map((row) => [...row, ...Array.from({ length: targetWidth - row.length }, () => "")]);
    const [headerRow, ...bodyRows] = paddedRows;
    const [rawHeaderRow, ...rawBodyRows] = paddedRawRows;
    const headers = headerRow.map((header, index) => header || `Kolom ${index + 1}`);
    const dataRows = bodyRows.filter((row) => row.some((cell) => String(cell).trim() !== ""));
    const rawDataRows = rawBodyRows.filter((row) => row.some((cell) => String(cell).trim() !== ""));
    if (!dataRows.length) throw new Error("Baris data tidak ditemukan. Pastikan format tabel sudah benar.");
    const parsed = {
      headers,
      rows: dataRows,
      dataRows,
      rawHeaders: rawHeaderRow,
      rawRows: rawDataRows,
      columnTypes: Array.from({ length: headers.length }, () => ""),
    };
    const warnings = validateChartStructure(parsed);
    parsed.warnings = warnings;
    if (warnings.length) parsed.validationMessage = "Data tidak terstruktur dengan baik";
    return parsed;
  }

  function parseDelimitedChartRows(value, format) {
    const delimiterMap = { csv: ",", tsv: "\t", pipe: "|", semicolon: ";" };
    if (format && format !== "auto" && delimiterMap[format]) return splitRowsWithDelimiter(value, delimiterMap[format]);
    const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);
    for (const delimiter of [",", "\t", "|", ";"]) {
      const parsed = splitRowsWithDelimiter(value, delimiter);
      if (parsed.length >= 2 && parsed.some((row) => row.length >= 2)) return parsed;
    }
    const spacedRows = lines.map((line) => line.split(/\s{2,}/).map((part) => part.trim()));
    if (spacedRows.length >= 2 && spacedRows.some((row) => row.length >= 2)) return spacedRows;
    return lines.map((line) => [line]);
  }

  function parseColonChartRows(value) {
    const rows = [["Label", "Nilai"]];
    value.split("\n").map((line) => line.trim()).filter(Boolean).forEach((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex > 0) rows.push([line.slice(0, separatorIndex).trim(), line.slice(separatorIndex + 1).trim()]);
    });
    return rows;
  }

  function splitRowsWithDelimiter(value, delimiter) {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(delimiter).map((cell) => cell.trim()));
  }

  function normalizeChartCell(cell) {
    const value = String(cell ?? "").trim();
    if (!value) return "";
    const numeric = parseChartNumber(value);
    return Number.isFinite(numeric) ? numeric : value;
  }

  function parseChartNumber(value) {
    const cleaned = String(value).replace(/\s/g, "").replace(/%$/, "").replace(/[^\d,.-]/g, "");
    if (!cleaned) return Number.NaN;
    const commaCount = (cleaned.match(/,/g) || []).length;
    const dotCount = (cleaned.match(/\./g) || []).length;
    let normalized = cleaned;
    if (commaCount && dotCount) normalized = cleaned.replace(/\./g, "").replace(",", ".");
    else if (commaCount && !dotCount) normalized = cleaned.replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  function parseEntityTimeChartRows(value) {
    const lines = String(value || "").split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return null;
    const parsedRows = [];
    const warnings = [];
    const context = { lastSingleMetricByLabelType: {} };

    lines.forEach((line) => {
      const row = extractNarrativeChartRow(line, context);
      if (!row) return;
      parsedRows.push(row);
    });

    if (parsedRows.length < 2) return null;
    const dominantLabelType = detectDominantNarrativeLabelType(parsedRows);
    if (!dominantLabelType) return null;
    const keptRows = parsedRows.filter((row) => row.labelType === dominantLabelType);
    if (keptRows.length < 2) return null;

    const omittedByType = parsedRows
      .filter((row) => row.labelType !== dominantLabelType)
      .reduce((acc, row) => {
        acc[row.labelType] = (acc[row.labelType] || 0) + 1;
        return acc;
      }, {});
    Object.entries(omittedByType).forEach(([labelType, count]) => {
      warnings.push(`${count} baris ${describeNarrativeLabelType(labelType)} dideteksi, tetapi chart difokuskan ke ${describeNarrativeLabelType(dominantLabelType)} agar hasil lebih konsisten.`);
    });

    const orderedRows = keptRows
      .slice()
      .sort((left, right) => left.sortValue - right.sortValue || left.label.localeCompare(right.label, "id"));
    const metricHeaders = [...new Set(orderedRows.flatMap((row) => Object.keys(row.metrics)))];
    if (!metricHeaders.length) return null;
    const normalizedRows = orderedRows.map((row) => [row.label, ...metricHeaders.map((header) => row.metrics[header] ?? "")]);
    const normalizedDataRows = orderedRows.map((row) => [row.label, ...metricHeaders.map((header) => row.metrics[header] ?? null)]);
    const columnTypes = [
      "Periode",
      ...metricHeaders.map((header, index) => metricTypeBadge(
        detectMetricKind(
          header,
          normalizedRows.map((row) => row[index + 1]),
          normalizedDataRows.map((row) => row[index + 1]),
        ),
      )),
    ];

    const parsed = {
      headers: ["Periode", ...metricHeaders],
      rows: normalizedRows,
      dataRows: normalizedDataRows,
      rawHeaders: ["Periode", ...metricHeaders],
      rawRows: normalizedRows,
      columnTypes,
      warnings: dedupeInsights(warnings),
      validationMessage: warnings.length ? "Data tidak terstruktur dengan baik" : "",
      hasTimeAxis: dominantLabelType !== "category",
      autoChartHint: dominantLabelType === "category" ? "" : "line",
    };
    return parsed;
  }

  function extractChartWeekLabel(value) {
    const match = String(value || "").match(/(?:minggu|week)\s*(?:ke[-\s]*)?(\d{1,2})/i);
    if (!match) return null;
    const index = Number(match[1]);
    if (!Number.isFinite(index)) return null;
    return { index, label: `Minggu ${index}` };
  }

  function extractNarrativeChartRow(line, context) {
    const cleanLine = String(line || "").replace(/^[\-\u2022*]+\s*/, "").trim();
    if (!cleanLine || !/\d/.test(cleanLine)) return null;
    const labelInfo = extractNarrativeLabel(cleanLine);
    if (!labelInfo) return null;
    const metrics = extractNarrativeMetricPairs(labelInfo.remainder, labelInfo, context);
    if (!Object.keys(metrics).length) return null;
    const singleMetric = Object.keys(metrics).length === 1 ? Object.keys(metrics)[0] : "";
    if (singleMetric) context.lastSingleMetricByLabelType[labelInfo.type] = singleMetric;
    return {
      label: labelInfo.label,
      labelType: labelInfo.type,
      sortValue: labelInfo.sortValue,
      metrics,
    };
  }

  function extractNarrativeLabel(line) {
    const temporal = extractTemporalLabel(line);
    if (temporal) return temporal;
    const pair = String(line || "").match(/^(.{1,60}?)(?:\s*[:=]\s*|\s+[-\u2192]\s+)(.+)$/);
    if (pair) {
      const label = String(pair[1] || "").trim();
      const remainder = String(pair[2] || "").trim();
      if (!label || !remainder || !/\d/.test(remainder)) return null;
      return {
        label,
        type: "category",
        sortValue: Number.MAX_SAFE_INTEGER,
        remainder,
      };
    }
    const spaced = String(line || "").match(/^([A-Za-z][A-Za-z\s&/()-]{1,40}?)\s+(-?\d+(?:[.,]\d+)?)(?:\D.*)?$/);
    if (!spaced) return null;
    const label = String(spaced[1] || "").trim();
    if (isNarrativeSectionHeader(label)) return null;
    return {
      label,
      type: "category",
      sortValue: Number.MAX_SAFE_INTEGER,
      remainder: String(line || "").slice(label.length).trim(),
    };
  }

  function extractTemporalLabel(line) {
    const text = String(line || "").trim();
    const monthMatch = text.match(/^(januari|jan(?:uary)?|februari|feb(?:ruary)?|maret|mar(?:ch)?|april|apr(?:il)?|mei|may|juni|jun(?:e)?|juli|jul(?:y)?|agustus|agu|aug(?:ust)?|september|sep(?:t(?:ember)?)?|okt(?:ober)?|oct(?:ober)?|nov(?:ember)?|des(?:ember)?|dec(?:ember)?)(?:\s*[:=\u2192|-]?\s*|\s+)(.+)$/i);
    if (monthMatch) {
      const monthIndex = getNarrativeMonthIndex(monthMatch[1]);
      return {
        label: normalizeNarrativeMonthLabel(monthMatch[1]),
        type: "month",
        sortValue: monthIndex,
        remainder: String(monthMatch[2] || "").trim(),
      };
    }
    const weekMatch = text.match(/^(?:minggu|week)\s*(?:ke[-\s]*)?(\d{1,2})(?:\s*[:=\u2192|-]?\s*|\s+)(.+)$/i);
    if (weekMatch) {
      const index = Number(weekMatch[1]);
      return {
        label: `Minggu ${index}`,
        type: "week",
        sortValue: 100 + index,
        remainder: String(weekMatch[2] || "").trim(),
      };
    }
    const quarterMatch = text.match(/^(q[1-4]|kuartal\s*[1-4]|quarter\s*[1-4])(?:\s*[:=\u2192|-]?\s*|\s+)(.+)$/i);
    if (quarterMatch) {
      const index = Number(String(quarterMatch[1]).match(/[1-4]/)?.[0]);
      return {
        label: `Q${index}`,
        type: "quarter",
        sortValue: 200 + index,
        remainder: String(quarterMatch[2] || "").trim(),
      };
    }
    const yearMatch = text.match(/^((?:19|20)\d{2})(?:\s*[:=\u2192|-]?\s*|\s+)(.+)$/);
    if (yearMatch) {
      const year = Number(yearMatch[1]);
      return {
        label: String(year),
        type: "year",
        sortValue: year,
        remainder: String(yearMatch[2] || "").trim(),
      };
    }
    return null;
  }

  function extractNarrativeMetricPairs(text, labelInfo, context) {
    const source = String(text || "").trim();
    if (!source) return {};
    const metrics = {};
    const addMetric = (header, rawValue) => {
      const numericValue = parseChartNumber(rawValue);
      if (!Number.isFinite(numericValue)) return;
      metrics[header] = numericValue;
    };

    const metricPatterns = [
      { header: "Penjualan", pattern: /(?:penjualan|sales?)\D{0,20}?(-?\d+(?:[.,]\d+)?)/gi },
      { header: "Profit", pattern: /(?:profit|laba)\D{0,20}?(-?\d+(?:[.,]\d+)?)/gi },
      { header: "Pelanggan", pattern: /(?:pelanggan|customers?|customer)\D{0,20}?(-?\d+(?:[.,]\d+)?)/gi },
      { header: "Komplain", pattern: /(?:komplain|complaints?|keluhan)\D{0,20}?(-?\d+(?:[.,]\d+)?)/gi },
      { header: "Tickets", pattern: /(?:tickets?|tiket|cases?)\D{0,20}?(-?\d+(?:[.,]\d+)?)/gi },
      { header: "Rating", pattern: /(?:rating|skor|score)\D{0,20}?(-?\d+(?:[.,]\d+)?)/gi },
      { header: "Visitors", pattern: /(?:visitors?|visitor|pengunjung|traffic|session|users?)\D{0,20}?(-?\d+(?:[.,]\d+)?)/gi },
      { header: "Revenue", pattern: /(?:revenue|omzet|gmv|income|pendapatan)\D{0,20}?(-?\d+(?:[.,]\d+)?)/gi },
    ];

    metricPatterns.forEach(({ header, pattern }) => {
      let match = pattern.exec(source);
      while (match) {
        addMetric(header, match[1]);
        match = pattern.exec(source);
      }
    });

    if (!("Penjualan" in metrics)) {
      const unitMatch = source.match(/(-?\d+(?:[.,]\d+)?)\s*(?:unit|units)\b/i);
      if (unitMatch) addMetric("Penjualan", unitMatch[1]);
    }

    const plainNumberMatch = source.match(/^\D*?(-?\d+(?:[.,]\d+)?)\D*$/);
    if (!Object.keys(metrics).length && plainNumberMatch) {
      const inferredMetric = context?.lastSingleMetricByLabelType?.[labelInfo.type]
        || (labelInfo.type === "category" ? "Jumlah" : "");
      if (inferredMetric) addMetric(inferredMetric, plainNumberMatch[1]);
    }

    return metrics;
  }

  function isNarrativeSectionHeader(label) {
    const text = String(label || "").trim().toLowerCase();
    if (!text) return true;
    return /^(semester|quarter|kuartal|q[1-4]|catatan|notes?|ringkasan|summary|tambahan|data|laporan)\b/.test(text);
  }

  function detectDominantNarrativeLabelType(rows) {
    const scoreByType = rows.reduce((acc, row) => {
      const metricCount = Object.keys(row.metrics || {}).length;
      acc[row.labelType] = (acc[row.labelType] || 0) + Math.max(1, metricCount);
      return acc;
    }, {});
    const ranked = Object.entries(scoreByType).sort((left, right) => right[1] - left[1]);
    return ranked[0]?.[0] || "";
  }

  function describeNarrativeLabelType(type) {
    if (type === "month") return "data bulanan";
    if (type === "week") return "data mingguan";
    if (type === "quarter") return "data kuartalan";
    if (type === "year") return "data tahunan";
    return "data kategori";
  }

  function normalizeNarrativeMonthLabel(value) {
    const monthIndex = getNarrativeMonthIndex(value);
    const labels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return labels[Math.max(0, monthIndex - 1)] || String(value || "").trim();
  }

  function getNarrativeMonthIndex(value) {
    const text = String(value || "").trim().toLowerCase();
    const aliases = {
      januari: 1,
      jan: 1,
      january: 1,
      februari: 2,
      feb: 2,
      february: 2,
      maret: 3,
      mar: 3,
      march: 3,
      april: 4,
      apr: 4,
      mei: 5,
      may: 5,
      juni: 6,
      jun: 6,
      june: 6,
      juli: 7,
      jul: 7,
      july: 7,
      agustus: 8,
      agu: 8,
      aug: 8,
      august: 8,
      september: 9,
      sep: 9,
      sept: 9,
      oktober: 10,
      okt: 10,
      october: 10,
      oct: 10,
      november: 11,
      nov: 11,
      desember: 12,
      des: 12,
      december: 12,
      dec: 12,
    };
    return aliases[text] || Number.MAX_SAFE_INTEGER;
  }

  function validateChartStructure(parsed) {
    const warnings = [...(parsed?.warnings || [])];
    if (!parsed?.dataRows?.length) {
      warnings.push("Data kosong.");
      return dedupeInsights(warnings);
    }
    const numericIndexes = parsed.headers
      .map((_, index) => parsed.dataRows.some((row) => typeof row[index] === "number" && Number.isFinite(row[index])) ? index : -1)
      .filter((index) => index >= 0);
    if (!numericIndexes.length) warnings.push("Tidak ada nilai numerik yang bisa divisualisasikan.");
    if (parsed.dataRows.some((row) => numericIndexes.every((index) => row[index] === null || row[index] === ""))) {
      warnings.push("Ada baris yang tidak konsisten karena seluruh nilai numeriknya kosong.");
    }
    return dedupeInsights(warnings);
  }

  function recommendChartType(parsed) {
    if (parsed?.autoChartHint === "line") {
      return { type: "line", label: "Line Chart", reason: "dataset terdeteksi sebagai rangkaian waktu naratif dengan beberapa metrik utama" };
    }
    const headers = parsed.headers;
    const rows = parsed.dataRows;
    const columnCount = headers.length;
    const firstColumnLabel = rows.every((row) => typeof row[0] !== "number");
    const numericColumns = headers.map((_, columnIndex) => rows.every((row) => typeof row[columnIndex] === "number"));
    const numericIndexes = numericColumns.map((isNumeric, index) => isNumeric ? index : -1).filter((index) => index >= 0);
    const labelValues = rows.map((row) => row[0]).filter((value) => value !== "");
    const timeLikeLabels = labelValues.length > 1 && labelValues.every((value) => typeof value === "string" && /^(q[1-4]|jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des|minggu|week|\d{4}|\d{1,2}[/-]\d{1,2})/i.test(value));

    if (columnCount >= 3 && numericIndexes.length === columnCount) return { type: "bubble", label: "Bubble Chart", reason: "semua kolom numerik sehingga relasi X, Y, dan ukuran bubble bisa langsung terbentuk" };
    if (columnCount >= 2 && numericIndexes.length >= 2 && !firstColumnLabel) return { type: "scatter", label: "Scatter Chart", reason: "dataset berisi beberapa kolom numerik tanpa label kategori yang dominan" };
    if (numericIndexes.length === 1 && firstColumnLabel) {
      if (rows.length <= 5) return { type: "donut", label: "Donut Chart", reason: "kategori sedikit sehingga proporsi tiap bagian terlihat jelas" };
      if (rows.length <= 8) return { type: "pie", label: "Pie Chart", reason: "jumlah kategori masih ringkas dan cocok untuk perbandingan proporsi" };
      if (rows.length > 12) return { type: "horizontal-bar", label: "Horizontal Bar", reason: "kategori cukup banyak sehingga label lebih nyaman dibaca secara horizontal" };
      return { type: "bar", label: "Bar Chart", reason: "ada satu nilai utama per kategori dan cocok dibandingkan per batang" };
    }
    if (numericIndexes.length >= 2 && firstColumnLabel) {
      if (timeLikeLabels) return { type: "line", label: "Line Chart", reason: "label tampak seperti urutan waktu sehingga tren lebih mudah dibaca" };
      if (rows.length <= 6) return { type: "radar", label: "Radar Chart", reason: "kategori sedikit dengan beberapa seri nilai sehingga perbandingan bentuknya terlihat cepat" };
      if (rows.length <= 10) return { type: "stacked-bar", label: "Stacked Bar", reason: "tiap kategori punya beberapa seri angka dan total komposisinya cocok dilihat bertumpuk" };
      return { type: "bar", label: "Bar Chart", reason: "dataset multiseri lebih aman dibaca sebagai perbandingan batang antar kategori" };
    }
    return { type: "bar", label: "Bar Chart", reason: "dataset paling cocok divisualkan sebagai perbandingan nilai per kategori" };
  }

  function summarizeSmartChartPlan(parsed) {
    const smartModel = buildSmartChartModel(parsed);
    if (!smartModel) return "";
    const groupNames = smartModel.groups.map((group) => `${group.label} (${group.metrics.length} metrik)`).join(", ");
    const relationships = detectMetricRelationships(smartModel);
    const relationText = relationships.length ? ` Insight cepat: ${relationships.join(" ")}` : "";
    return `Data dideteksi otomatis lalu digabungkan per periode. Kolom angka diklasifikasi menjadi rate, score, time, count, atau monetary berdasarkan pola nama, format isi, dan skala nilainya. Series yang beda skala besar dipisah bila rasio max lebih dari 50x, setiap chart dibatasi maksimal 5 series, dan jumlah chart akan adaptif mengikuti banyaknya metrik. Grup aktif: ${groupNames}.${relationText}`;
  }

  function buildChartState(parsed, requestedType, meta = {}) {
    const prepared = prepareChartSeries(parsed, requestedType);
    if (!prepared || !prepared.series.length) return null;
    const canvas = buildPreparedChartCanvas(prepared, meta);
    return { canvas, typeLabel: prettyChartType(prepared.type), type: prepared.type };
  }

  function buildPreparedChartCanvas(prepared, meta = {}, width = 1200, height = 760) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    drawChartCanvas(canvas, prepared, meta);
    return canvas;
  }

  function buildSmartChartPreview(parsed, requestedType, meta = {}) {
    const smartModel = buildSmartChartModel(parsed);
    if (!smartModel || !smartModel.groups.length) {
      const fallbackType = requestedType && requestedType !== "auto" ? requestedType : recommendChartType(parsed).type;
      const fallback = buildChartState(parsed, fallbackType, meta);
      if (!fallback) return null;
      return {
        previewNode: fallback.canvas,
        exportCanvas: fallback.canvas,
        typeLabel: fallback.typeLabel,
        statusLabel: `Chart ${fallback.typeLabel.toLowerCase()}`,
        displayParsed: parsed,
        tableNote: "",
        charts: [{ title: meta.title || "Auto Chart Insight", filename: slugify(meta.title || "auto-chart") || "auto-chart", canvas: fallback.canvas }],
      };
    }

    const previewNode = document.createElement("div");
    previewNode.className = "chart-preview-stack";
    const chartCanvases = [];
    const charts = [];
    let chartCount = 0;
    const allMetrics = smartModel.groups.flatMap((group) => group.metrics).sort((left, right) => right.score - left.score);

    if (meta.seriesLayout === "single") {
      const mergedMetrics = limitMetricsForSingleChart(smartModel.groups.flatMap((group) => group.metrics).sort((left, right) => right.score - left.score));
      const mergedParsed = buildSmartChunkParsed(smartModel, mergedMetrics);
      const mergedType = requestedType && requestedType !== "auto" ? requestedType : "line";
      const prepared = prepareChartSeries(mergedParsed, mergedType);
      if (prepared?.series?.length) {
        const chunkTitle = meta.title?.trim() || "Combined Performance";
        const chunkInsights = buildChunkInsights(smartModel, mergedMetrics, { label: "Combined Performance", context: "general" });
        const canvas = buildPreparedChartCanvas(prepared, {
          title: chunkTitle,
          subtitle: meta.subtitle?.trim() || "",
        }, 1160, 540);
        const filename = slugify(chunkTitle) || "combined-performance";
        const card = document.createElement("section");
        card.className = "chart-preview-card is-primary";
        card.innerHTML = `<div class="chart-preview-card-title">${chunkTitle}</div>`;
        card.appendChild(canvas);
        if (chunkInsights.length) {
          card.insertAdjacentHTML("beforeend", `
            <div class="chart-insight-box">
              <strong>Insight</strong>
              <ul class="tool-list">${chunkInsights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </div>
          `);
        }
        card.insertAdjacentHTML("beforeend", `
          <div class="action-row compact-actions">
            <button class="button secondary-button" type="button" data-chart-download="${filename}" data-chart-format="png">PNG</button>
            <button class="button secondary-button" type="button" data-chart-download="${filename}" data-chart-format="jpg">JPG</button>
            <button class="button secondary-button" type="button" data-chart-download="${filename}" data-chart-format="webp">WEBP</button>
            <button class="button secondary-button" type="button" data-chart-download="${filename}" data-chart-format="pdf">PDF</button>
          </div>
        `);
        previewNode.appendChild(card);
        chartCanvases.push(canvas);
        charts.push({ title: chunkTitle, filename, canvas, metrics: mergedMetrics, group: { label: "Combined Performance", context: "general" } });
        chartCount = 1;
      }
    } else {

      smartModel.groups.forEach((group) => {
        resolveMetricChunksForPreview(group.metrics, meta.seriesLayout).forEach((metricChunk, chunkIndex) => {
          const chunkParsed = buildSmartChunkParsed(smartModel, metricChunk);
          const preferredType = requestedType && requestedType !== "auto" ? requestedType : group.defaultType;
          const prepared = prepareChartSeries(chunkParsed, preferredType);
          if (!prepared || !prepared.series.length) return;
          const chunkTitle = deriveChartTitle(group, metricChunk, chunkIndex, chartCount);
          const chunkInsights = buildChunkInsights(smartModel, metricChunk, group);
          const canvas = buildPreparedChartCanvas(prepared, {
            title: meta.title?.trim() ? `${meta.title.trim()} • ${chunkTitle}` : chunkTitle,
            subtitle: meta.subtitle?.trim() || "",
          }, 1160, 540);
          const filename = slugify(chunkTitle) || `chart-${chartCount + 1}`;
          const card = document.createElement("section");
          card.className = `chart-preview-card${chartCount === 0 ? " is-primary" : ""}`;
          const cardTitle = document.createElement("div");
          cardTitle.className = "chart-preview-card-title";
          cardTitle.textContent = chunkTitle;
          card.appendChild(cardTitle);
          card.appendChild(canvas);
          if (chunkInsights.length) {
            card.insertAdjacentHTML("beforeend", `
              <div class="chart-insight-box">
                <strong>Insight</strong>
                <ul class="tool-list">${chunkInsights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
              </div>
            `);
          }
          card.insertAdjacentHTML("beforeend", `
            <div class="action-row compact-actions">
              <button class="button secondary-button" type="button" data-chart-download="${filename}" data-chart-format="png">PNG</button>
              <button class="button secondary-button" type="button" data-chart-download="${filename}" data-chart-format="jpg">JPG</button>
              <button class="button secondary-button" type="button" data-chart-download="${filename}" data-chart-format="webp">WEBP</button>
              <button class="button secondary-button" type="button" data-chart-download="${filename}" data-chart-format="pdf">PDF</button>
            </div>
          `);
          previewNode.appendChild(card);
          chartCanvases.push(canvas);
          charts.push({ title: chunkTitle, filename, canvas, metrics: metricChunk, group });
          chartCount += 1;
        });
      });
    }

    if (!chartCanvases.length) return null;
    const correlationCard = buildCorrelationCard(smartModel, allMetrics);
    if (correlationCard) {
      previewNode.appendChild(correlationCard.card);
      chartCanvases.push(correlationCard.canvas);
      charts.push({ title: correlationCard.title, filename: correlationCard.filename, canvas: correlationCard.canvas, metrics: correlationCard.metrics, group: { label: correlationCard.title, context: "general" } });
      chartCount += 1;
    }
    previewNode.querySelectorAll("[data-chart-download]").forEach((button) => {
      button.addEventListener("click", async () => {
        const target = charts.find((chart) => chart.filename === button.dataset.chartDownload);
        if (!target) return;
        await downloadSingleChart(target, button.dataset.chartFormat);
      });
    });

    return {
      previewNode,
      exportCanvas: combineChartCanvases(chartCanvases),
      typeLabel: `${chartCount} Smart Chart`,
      statusLabel: `${chartCount} smart chart`,
      displayParsed: smartModel.displayParsed,
      tableNote: "Preview tabel sudah digabungkan per periode dan bisa digeser ke samping saat kolom terlalu banyak.",
      charts,
      smartModel,
    };
  }

  async function downloadSingleChart(chart, format) {
    if (format === "pdf") {
      const { jsPDF } = (await ensureLibrary("jspdf")).jsPDF ? (await ensureLibrary("jspdf")) : window.jspdf;
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const ratio = Math.min((pageWidth - margin * 2) / chart.canvas.width, (pageHeight - margin * 2) / chart.canvas.height);
      const width = chart.canvas.width * ratio;
      const height = chart.canvas.height * ratio;
      pdf.addImage(chart.canvas.toDataURL("image/png"), "PNG", (pageWidth - width) / 2, (pageHeight - height) / 2, width, height);
      pdf.save(`${chart.filename}.pdf`);
      return;
    }
    const mime = format === "png" ? "image/png" : format === "jpg" ? "image/jpeg" : "image/webp";
    const blob = await canvasToBlob(chart.canvas, mime, format === "png" ? undefined : 0.94);
    downloadBlob(blob, `${chart.filename}.${format}`);
  }

  function buildSmartChartModel(parsed) {
    const periodIndex = detectPeriodColumn(parsed);
    if (periodIndex === null) return null;

    const metrics = parsed.headers
      .map((header, index) => {
        if (index === periodIndex) return null;
        const values = parsed.dataRows.map((row) => row[index]);
        const numericCount = values.filter((value) => typeof value === "number" && Number.isFinite(value)).length;
        if (!numericCount) return null;
        const rawValues = (parsed.rawRows || []).map((row) => row[index]);
        const seriesStats = describeNumericSeries(values);
        const kind = detectMetricKind(header, rawValues, values, seriesStats);
        return {
          index,
          header: String(header),
          kind,
          context: detectMetricContext(header),
          aggregation: kind === "percentage" ? "avg" : "sum",
          score: scoreMetricSeries(values, header),
          seriesStats,
        };
      })
      .filter(Boolean);

    if (!metrics.length) return null;

    const groupedRows = aggregateRowsByPeriod(parsed, periodIndex, metrics);
    if (groupedRows.length < 1) return null;
    const segmentInsights = buildSegmentInsights(parsed, metrics);

    const groupedMetrics = groupMetricsForCharts(metrics);
    const groups = groupedMetrics
      .map((group) => ({
        ...group,
        metrics: group.metrics.sort((left, right) => right.score - left.score),
        defaultType: pickDefaultChartType(group, smartModelHasTimeAxis(groupedRows, periodIndex)),
        note: buildGroupNote(group),
      }))
      .sort((left, right) => (right.metrics[0]?.score || 0) - (left.metrics[0]?.score || 0))
      .filter((group) => group.metrics.length);

    if (!groups.length) return null;

    const displayParsed = {
      headers: [parsed.headers[periodIndex], ...metrics.map((metric) => metric.header)],
      rows: groupedRows.map((row) => [row.periodLabel, ...metrics.map((metric) => row.values[metric.index] ?? "—")]),
      dataRows: groupedRows.map((row) => [row.periodLabel, ...metrics.map((metric) => row.values[metric.index] ?? null)]),
      columnTypes: ["Periode", ...metrics.map((metric) => metricTypeBadge(metric.kind))],
    };

    return {
      periodHeader: String(parsed.headers[periodIndex]),
      groupedRows,
      groups,
      displayParsed,
      segmentInsights,
    };
  }

  function limitMetricsForSingleChart(metrics) {
    const maxMetrics = metrics.length <= 4 ? metrics.length : 6;
    return metrics.slice(0, Math.max(1, maxMetrics));
  }

  function buildSegmentInsights(parsed, metrics) {
    const segments = detectSegmentColumns(parsed);
    if (!segments.length) return [];
    const revenueMetric = metrics.find((metric) => metric.context === "revenue") || metrics[0];
    const customerMetric = metrics.find((metric) => metric.context === "customer");
    const marketingMetric = metrics.find((metric) => metric.context === "marketing");
    const insights = [];
    segments.forEach((segment) => {
      const revenueLine = compareSegmentPerformance(parsed, segment, revenueMetric, "revenue");
      if (revenueLine) insights.push(revenueLine);
      const customerLine = customerMetric ? compareSegmentPerformance(parsed, segment, customerMetric, "customer") : "";
      if (customerLine) insights.push(customerLine);
      const efficiencyLine = revenueMetric && marketingMetric ? compareSegmentEfficiency(parsed, segment, marketingMetric, revenueMetric) : "";
      if (efficiencyLine) insights.push(efficiencyLine);
    });
    return dedupeInsights(insights).slice(0, 3);
  }

  function detectSegmentColumns(parsed) {
    return parsed.headers
      .map((header, index) => {
        const text = String(header || "").toLowerCase();
        if (/channel|kanal|source|lead source|campaign|kampanye|ads|organic|media/i.test(text)) return { index, label: "Channel" };
        if (/region|wilayah|area|kota|city|branch|cabang/i.test(text)) return { index, label: "Region" };
        return null;
      })
      .filter(Boolean)
      .slice(0, 2);
  }

  function compareSegmentPerformance(parsed, segment, metric, mode) {
    if (!metric) return "";
    const bucketMap = buildSegmentMetricBuckets(parsed, segment.index, metric);
    if (bucketMap.size < 2) return "";
    const ranked = [...bucketMap.entries()].sort((left, right) => right[1] - left[1]).slice(0, 2);
    const [winner, runnerUp] = ranked;
    if (!winner || !runnerUp || !Number.isFinite(winner[1]) || !Number.isFinite(runnerUp[1])) return "";
    const ratio = runnerUp[1] ? winner[1] / runnerUp[1] : 0;
    if (!Number.isFinite(ratio) || ratio < 1.08) return "";
    if (mode === "customer") return `${segment.label} ${winner[0]} punya ${metric.header} sekitar ${ratio.toFixed(1)}x lebih kuat dibanding ${runnerUp[0]}.`;
    return `${segment.label} ${winner[0]} menghasilkan ${metric.header} sekitar ${ratio.toFixed(1)}x dibanding ${runnerUp[0]}.`;
  }

  function compareSegmentEfficiency(parsed, segment, spendMetric, revenueMetric) {
    const spendBuckets = buildSegmentMetricBuckets(parsed, segment.index, spendMetric);
    const revenueBuckets = buildSegmentMetricBuckets(parsed, segment.index, revenueMetric);
    const candidates = [...revenueBuckets.keys()]
      .map((key) => ({
        key,
        spend: spendBuckets.get(key),
        revenue: revenueBuckets.get(key),
      }))
      .filter((item) => Number.isFinite(item.spend) && item.spend > 0 && Number.isFinite(item.revenue));
    if (candidates.length < 2) return "";
    const ranked = candidates
      .map((item) => ({ ...item, efficiency: item.revenue / item.spend }))
      .sort((left, right) => right.efficiency - left.efficiency);
    const leader = ranked[0];
    const challenger = ranked[1];
    if (!leader || !challenger || leader.efficiency / Math.max(challenger.efficiency, 1e-6) < 1.12) return "";
    return `${segment.label} ${leader.key} terlihat paling efisien: ${revenueMetric.header} ${formatCompactNumber(leader.revenue)} dari ${spendMetric.header} ${formatCompactNumber(leader.spend)}.`;
  }

  function buildSegmentMetricBuckets(parsed, segmentIndex, metric) {
    const buckets = new Map();
    parsed.dataRows.forEach((row, rowIndex) => {
      const segmentLabel = String(parsed.rawRows?.[rowIndex]?.[segmentIndex] ?? row[segmentIndex] ?? "").trim();
      const value = row[metric.index];
      if (!segmentLabel || !Number.isFinite(value)) return;
      const current = buckets.get(segmentLabel) || { sum: 0, count: 0 };
      current.sum += Number(value);
      current.count += 1;
      buckets.set(segmentLabel, current);
    });
    return new Map([...buckets.entries()].map(([key, value]) => [
      key,
      metric.aggregation === "avg" ? value.sum / Math.max(value.count, 1) : value.sum,
    ]));
  }

  function formatCompactNumber(value) {
    return new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value) || 0);
  }

  function detectPeriodColumn(parsed) {
    const headerIndex = parsed.headers.findIndex((header) => /periode|period|bulan|month|tanggal|date|minggu|week|quarter|kuartal|tahun|year/i.test(String(header)));
    if (headerIndex >= 0) return headerIndex;
    const matches = parsed.headers.map((_, index) => parsed.dataRows.filter((row) => isTimeLikeValue(row[index])).length);
    const bestScore = Math.max(...matches, 0);
    if (!bestScore) return null;
    const bestIndex = matches.findIndex((score) => score === bestScore);
    return bestScore >= Math.max(2, Math.ceil(parsed.dataRows.length * 0.6)) ? bestIndex : null;
  }

  function isTimeLikeValue(value) {
    if (typeof value === "number") return false;
    const text = String(value || "").trim();
    if (!text) return false;
    if (extractChartWeekLabel(text)) return true;
    if (extractTemporalLabel(`${text} 1`)?.type === "month") return true;
    if (/^(q[1-4]|kuartal\s*[1-4]|quarter\s*[1-4])$/i.test(text)) return true;
    if (/^\d{4}([/-]\d{1,2}){0,2}$/.test(text)) return true;
    if (/^(q[1-4]|jan|feb|mar|apr|mei|jun|jul|agu|aug|sep|okt|oct|nov|des|dec)/i.test(text)) return true;
    return Number.isFinite(Date.parse(text));
  }

  function detectMetricKind(header, rawValues = [], numericValues = [], stats = describeNumericSeries(numericValues)) {
    const text = String(header || "").toLowerCase();
    const looksPercent = /%|percent|persen|rate|ratio|rasio|share|yield|ctr|cvr|conversion/i.test(text)
      || rawValues.some((value) => /%/.test(String(value || "")));
    if (looksPercent) return "percentage";
    if (/score|nilai|index|skor|grade|rating|point|poin|nps/i.test(text) || (stats.max <= 100 && stats.min >= 0 && stats.distinct <= 12)) return "score";
    if (/durasi|duration|time|jam|hour|hours|menit|minute|min|detik|second|sec/i.test(text)) return "time";
    if (/amount|value|revenue|sales|profit|cost|price|fee|budget|spend|income|expense|target|total|gross|net|nominal|rp|idr|usd|eur/i.test(text) || isMonetarySeries(rawValues, stats)) return "currency";
    return "count";
  }

  function detectMetricContext(header) {
    const text = String(header || "").toLowerCase();
    if (/stok|stock|inventory|warehouse|gudang/i.test(text)) return "inventory";
    if (/nps|retention|conversion|customer|customers|pelanggan|lead|traffic|session|user|visitor|tickets?|ticket|komplain|complaint|keluhan|rating|return rate|churn/i.test(text)) return "customer";
    if (/diskon|discount|cac|refund|spend|cost|campaign|iklan|ads|marketing|promo/i.test(text)) return "marketing";
    if (/penjualan|sales|revenue|profit|margin|gmv|omzet|income|target/i.test(text)) return "revenue";
    if (/sla|durasi|duration|jam|menit|minute|hour|time/i.test(text)) return "operations";
    return "general";
  }

  function scoreMetricSeries(values, header = "") {
    const numericValues = values.filter((value) => typeof value === "number" && Number.isFinite(value));
    if (!numericValues.length) return 0;
    const total = numericValues.reduce((sum, value) => sum + Math.abs(value), 0);
    const max = Math.max(...numericValues);
    const min = Math.min(...numericValues);
    let priorityBoost = 1;
    if (/penjualan|sales|revenue|omzet|gmv/i.test(header)) priorityBoost = 2.4;
    else if (/profit|margin/i.test(header)) priorityBoost = 2.1;
    else if (/pelanggan|customer|visitor|tickets?|komplain|complaint/i.test(header)) priorityBoost = 1.9;
    else if (/conversion|retention|nps|kpi|ctr|cvr/i.test(header)) priorityBoost = 1.8;
    return (total + Math.abs(max - min) * 3) * priorityBoost;
  }

  function describeNumericSeries(values) {
    const numericValues = values.filter((value) => typeof value === "number" && Number.isFinite(value));
    if (!numericValues.length) return { min: 0, max: 0, mean: 0, distinct: 0 };
    const total = numericValues.reduce((sum, value) => sum + value, 0);
    return {
      min: Math.min(...numericValues),
      max: Math.max(...numericValues),
      mean: total / numericValues.length,
      distinct: new Set(numericValues.map((value) => value.toFixed(6))).size,
    };
  }

  function isMonetarySeries(rawValues, stats) {
    const currencyHints = rawValues.filter((value) => /(rp|idr|usd|eur|\$|€|£)/i.test(String(value || ""))).length;
    if (currencyHints >= Math.max(1, Math.ceil(rawValues.length * 0.2))) return true;
    return stats.max >= 1000 && stats.mean >= 500;
  }

  function buildGroupNote(group) {
    if (group.kind === "percentage") return "Metrik rate atau persen dirata-ratakan per periode.";
    if (group.kind === "score") return "Metrik score atau indeks dikelompokkan pada skala 0-100.";
    if (group.kind === "time") return "Metrik waktu dipisah agar tidak bercampur dengan nominal atau jumlah.";
    if (group.kind === "currency") return "Metrik nominal besar dipisah agar skala tetap terbaca.";
    return "Metrik jumlah dikelompokkan sendiri agar pembacaan tren lebih jelas.";
  }

  function smartModelHasTimeAxis(groupedRows) {
    return groupedRows.length >= 2;
  }

  function pickDefaultChartType(group, hasTimeAxis) {
    if (hasTimeAxis) return "line";
    if (group.metrics.length === 1) return "bar";
    return "horizontal-bar";
  }

  function aggregateRowsByPeriod(parsed, periodIndex, metrics) {
    const grouped = new Map();
    parsed.dataRows.forEach((row, rowIndex) => {
      const rawLabel = String(parsed.rawRows?.[rowIndex]?.[periodIndex] ?? row[periodIndex] ?? "").trim();
      const periodLabel = rawLabel || `Periode ${rowIndex + 1}`;
      if (!grouped.has(periodLabel)) grouped.set(periodLabel, { periodLabel, sortValue: parsePeriodSortValue(periodLabel), metrics: {} });
      const bucket = grouped.get(periodLabel);
      metrics.forEach((metric) => {
        const value = Number(row[metric.index]);
        if (!Number.isFinite(value)) return;
        if (!bucket.metrics[metric.index]) bucket.metrics[metric.index] = { sum: 0, count: 0 };
        bucket.metrics[metric.index].sum += value;
        bucket.metrics[metric.index].count += 1;
      });
    });

    return [...grouped.values()]
      .sort((left, right) => left.sortValue - right.sortValue || left.periodLabel.localeCompare(right.periodLabel, "id"))
      .map((entry) => ({
        periodLabel: entry.periodLabel,
        values: Object.fromEntries(metrics.map((metric) => {
          const bucket = entry.metrics[metric.index];
          const value = !bucket
            ? null
            : metric.aggregation === "avg"
              ? bucket.sum / Math.max(bucket.count, 1)
              : bucket.sum;
          return [metric.index, value];
        })),
      }));
  }

  function parsePeriodSortValue(label) {
    const text = String(label || "").trim();
    const weekInfo = extractChartWeekLabel(text);
    if (weekInfo) return 100 + weekInfo.index;
    const temporal = extractTemporalLabel(`${text} 1`);
    if (temporal?.type === "month") return temporal.sortValue;
    if (/^(q[1-4]|kuartal\s*[1-4]|quarter\s*[1-4])$/i.test(text)) return 200 + Number(text.match(/[1-4]/)?.[0] || 0);
    if (/^(?:19|20)\d{2}$/.test(text)) return Number(text);
    if (/^\d{4}([/-]\d{1,2}){0,2}$/.test(text)) {
      const safe = text.replace(/\//g, "-");
      const normalized = safe.length === 4 ? `${safe}-01-01` : safe.length === 7 ? `${safe}-01` : safe;
      const parsed = Date.parse(normalized);
      if (Number.isFinite(parsed)) return parsed;
    }
    const parsed = Date.parse(text);
    if (Number.isFinite(parsed)) return parsed;
    return Number.MAX_SAFE_INTEGER;
  }

  function groupMetricsForCharts(metrics) {
    const groups = [];
    metrics.forEach((metric) => {
      const key = metric.context === "customer" ? "customer:combined" : `${metric.context}:${metric.kind}`;
      let target = groups.find((group) => group.key === key);
      if (!target) {
        target = {
          key,
          kind: metric.context === "customer" ? "customer-mixed" : metric.kind,
          context: metric.context,
          label: buildGroupLabel(metric.context, metric.context === "customer" ? "customer-mixed" : metric.kind),
          metrics: [],
        };
        groups.push(target);
      }
      target.metrics.push(metric);
    });
    return groups.filter((group) => group.metrics.length);
  }

  function buildGroupLabel(context, kind) {
    const contextName = {
      inventory: "Inventory",
      customer: "Customer",
      marketing: "Marketing",
      revenue: "Revenue",
      operations: "Operations",
      general: "General",
    }[context] || "General";
    const kindName = {
      currency: "Value",
      percentage: "Rate",
      "customer-mixed": "Performance",
      score: "Score",
      time: "Time",
      count: "Volume",
    }[kind] || "Metric";
    return `${contextName} ${kindName}`;
  }

  function resolveMetricChunksForPreview(metrics, seriesLayout = "auto") {
    const ranked = [...metrics].sort((left, right) => right.score - left.score);
    const trimmed = ranked.slice(0, ranked.length <= 5 ? ranked.length : Math.min(12, ranked.length));
    if (seriesLayout === "single") return [trimmed];
    if (trimmed.length && trimmed.every((metric) => metric.context === "customer")) return [trimmed];
    const maxPerChart = 5;
    if (seriesLayout === "split") return chunkArray(trimmed, Math.min(3, maxPerChart));

    const groups = [];
    trimmed.forEach((metric) => {
      const metricScale = Math.max(Math.abs(metric.seriesStats?.max ?? 0), Math.abs(metric.seriesStats?.mean ?? 0), 1);
      let targetGroup = null;
      if (seriesLayout === "merged") {
        targetGroup = groups.find((group) => group.length < maxPerChart);
      } else {
        targetGroup = groups.find((group) => {
          if (group.length >= maxPerChart) return false;
          const baseScale = Math.max(...group.map((item) => Math.max(Math.abs(item.seriesStats?.max ?? 0), Math.abs(item.seriesStats?.mean ?? 0), 1)));
          const ratio = Math.max(baseScale, metricScale) / Math.max(1, Math.min(baseScale, metricScale));
          return ratio <= 50;
        });
      }
      if (!targetGroup) {
        targetGroup = [];
        groups.push(targetGroup);
      }
      targetGroup.push(metric);
    });
    return groups;
  }

  function deriveChartTitle(group, metrics, chunkIndex, chartIndex) {
    const headers = metrics.map((metric) => metric.header).join(", ");
    if (metrics.some((metric) => /penjualan|sales|revenue|omzet|gmv/i.test(metric.header))) return chunkIndex ? `Revenue Trend ${chunkIndex + 1}` : "Revenue Trend";
    if (metrics.some((metric) => /profit|margin/i.test(metric.header))) return chunkIndex ? `Profit Performance ${chunkIndex + 1}` : "Profit Performance";
    if (metrics.some((metric) => /conversion|retention|nps|customer|traffic|session/i.test(metric.header))) return chunkIndex ? `Customer Performance ${chunkIndex + 1}` : "Customer Performance";
    if (metrics.some((metric) => /diskon|discount|cac|refund|marketing|spend|campaign|promo/i.test(metric.header))) return chunkIndex ? `Marketing Cost ${chunkIndex + 1}` : "Marketing Cost";
    if (metrics.some((metric) => /stok|stock|inventory/i.test(metric.header))) return chunkIndex ? `Inventory Movement ${chunkIndex + 1}` : "Inventory Movement";
    return chartIndex ? `${group.label} ${chartIndex + 1}` : group.label;
  }

  function detectMetricRelationships(smartModel) {
    const candidates = smartModel.groups
      .flatMap((group) => group.metrics)
      .sort((left, right) => right.score - left.score)
      .slice(0, 6);
    const notes = [];
    for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
        const left = candidates[leftIndex];
        const right = candidates[rightIndex];
        const leftSeries = smartModel.groupedRows.map((row) => row.values[left.index] ?? 0);
        const rightSeries = smartModel.groupedRows.map((row) => row.values[right.index] ?? 0);
        const leftTrend = seriesTrend(leftSeries);
        const rightTrend = seriesTrend(rightSeries);
        if (!leftTrend || !rightTrend) continue;
        if (leftTrend > 0 && rightTrend < 0) {
          notes.push(`Warning: ${left.header} naik sementara ${right.header} turun.`);
        } else if (leftTrend < 0 && rightTrend > 0) {
          notes.push(`Warning: ${right.header} naik sementara ${left.header} turun.`);
        } else if ((leftTrend > 0 && rightTrend > 0) || (leftTrend < 0 && rightTrend < 0)) {
          notes.push(`${left.header} dan ${right.header} bergerak searah.`);
        }
        if (notes.length >= 2) return notes;
      }
    }
    return notes;
  }

  function seriesTrend(values) {
    const numeric = (values || []).filter((value) => value !== null && Number.isFinite(value));
    if (numeric.length < 2) return 0;
    let score = 0;
    for (let index = 1; index < numeric.length; index += 1) {
      score += numeric[index] - numeric[index - 1];
    }
    if (Math.abs(score) < 1e-6) return 0;
    return score > 0 ? 1 : -1;
  }

  function buildDualAxisConfig(series) {
    const magnitudes = series.map((item, index) => ({
      index,
      max: Math.max(...item.values.filter((value) => value !== null && Number.isFinite(value)).map((value) => Math.abs(value)), 0),
    })).filter((item) => item.max > 0);
    if (magnitudes.length < 2) return null;
    magnitudes.sort((left, right) => right.max - left.max);
    const largest = magnitudes[0].max;
    const secondary = magnitudes.filter((item) => largest / Math.max(item.max, 1) >= 12).map((item) => item.index);
    if (!secondary.length || secondary.length === series.length) return null;
    const primary = series.map((_, index) => index).filter((index) => !secondary.includes(index));
    return { primary, secondary };
  }

  function drawPointMarker(context, x, y, value, label, markers) {
    const labelText = String(label || "");
    const isZero = Number(value) === 0 || markers.zeros.includes(labelText);
    const isNegative = Number(value) < 0 || markers.negatives.includes(labelText);
    const isOutlier = markers.extremeUps.includes(labelText) || markers.extremeDowns.includes(labelText);
    const isMissing = markers.missing.includes(labelText);
    if (!isZero && !isNegative && !isOutlier && !isMissing) return;
    context.save();
    if (isOutlier) {
      context.fillStyle = "rgba(249, 115, 22, 0.22)";
      context.beginPath();
      context.arc(x, y, 13, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#f97316";
      context.lineWidth = 2;
      context.beginPath();
      context.arc(x, y, 10, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = "#c2410c";
      context.font = '700 11px "Segoe UI", Arial, sans-serif';
      context.fillText("Spike", x + 10, y - 10);
    }
    if (isZero) {
      context.fillStyle = "#0f172a";
      context.fillRect(x - 4, y - 4, 8, 8);
    }
    if (isNegative) {
      context.strokeStyle = "#dc2626";
      context.lineWidth = 2.2;
      context.beginPath();
      context.moveTo(x - 6, y - 6);
      context.lineTo(x + 6, y + 6);
      context.moveTo(x + 6, y - 6);
      context.lineTo(x - 6, y + 6);
      context.stroke();
    }
    if (isMissing) {
      context.fillStyle = "#475569";
      context.font = '600 10px "Segoe UI", Arial, sans-serif';
      context.fillText("Missing", x + 8, y + 16);
    }
    context.restore();
  }

  function metricTypeBadge(kind) {
    if (kind === "currency") return "💰 Monetary";
    if (kind === "percentage") return "📊 Persen";
    if (kind === "count") return "🔢 Jumlah";
    if (kind === "score") return "🎯 Score";
    if (kind === "time") return "⏱️ Waktu";
    return "📌 Metric";
  }

  function buildGlobalSummary(smartModel) {
    const priorityMetrics = smartModel.groups.flatMap((group) => group.metrics).sort((left, right) => right.score - left.score).slice(0, 3);
    return priorityMetrics.map((metric) => summarizeMetricChange(smartModel, metric));
  }

  function buildMetricInsights(smartModel) {
    const focusMetrics = smartModel.groups.flatMap((group) => group.metrics).sort((left, right) => right.score - left.score).slice(0, 4);
    return focusMetrics.map((metric) => describeMetricPattern(smartModel, metric));
  }

  function detectAnomalies(smartModel) {
    const anomalies = [];
    smartModel.groups.flatMap((group) => group.metrics).forEach((metric) => {
      const rows = smartModel.groupedRows;
      const series = getMetricSeries(smartModel, metric);
      const details = detectSeriesEvents(series, rows);
      details.extremeUps.forEach((period) => anomalies.push(`Lonjakan ekstrem ${metric.header} pada ${period}.`));
      details.missing.forEach((period) => anomalies.push(`Data missing ${metric.header} pada ${period}.`));
      details.zeros.forEach((period) => anomalies.push(`Nilai 0 ${metric.header} pada ${period}.`));
      if (details.negatives.length) anomalies.push(`${metric.header} negatif pada ${details.negatives.join(" & ")}.`);
    });
    return [...new Set(anomalies)].slice(0, 8);
  }

  function summarizeMetricChange(smartModel, metric) {
    const series = interpolateSeries(getMetricSeries(smartModel, metric));
    const first = firstNumericValue(series);
    const last = lastNumericValue(series);
    const changePct = first ? (((last - first) / Math.abs(first)) * 100) : 0;
    const verb = changePct > 2 ? "naik" : changePct < -2 ? "turun" : "stabil";
    return `${metric.header} ${verb} ${Math.abs(changePct).toFixed(1)}% secara keseluruhan dengan kekuatan tren ${trendStrengthLabel(series)}.`;
  }

  function describeMetricPattern(smartModel, metric) {
    const rows = smartModel.groupedRows;
    const series = getMetricSeries(smartModel, metric);
    const cleanSeries = series.filter((value) => value !== null && Number.isFinite(value));
    if (cleanSeries.length < 2) return `${metric.header} belum punya cukup titik data untuk dianalisis.`;
    const events = detectSeriesEvents(series, rows);
    const peakValue = Math.max(...cleanSeries);
    const troughValue = Math.min(...cleanSeries);
    const peakIndex = series.findIndex((value) => value === peakValue);
    const troughIndex = series.findIndex((value) => value === troughValue);
    const trend = seriesTrend(interpolateSeries(series));
    const trendLabel = trend > 0 ? "cenderung naik" : trend < 0 ? "cenderung turun" : "relatif stabil";
    const rebound = troughIndex > 0 && troughIndex < series.length - 1 && series[troughIndex + 1] > series[troughIndex];
    if (events.negatives.length) return `${metric.header} ${trendLabel} dengan nilai negatif pada ${events.negatives.join(" & ")}.`;
    if (events.missing.length) return `${metric.header} ${trendLabel} namun ada data missing pada ${events.missing.join(" & ")}.`;
    if (events.zeros.length) return `${metric.header} ${trendLabel} namun sempat bernilai 0 pada ${events.zeros.join(" & ")}.`;
    if (events.extremeUps.length) return `${metric.header} ${trendLabel} dengan lonjakan ekstrem pada ${events.extremeUps[0]}.`;
    if (rebound) return `${metric.header} ${trendLabel}, turun di ${rows[troughIndex]?.periodLabel || "salah satu periode"} lalu mulai naik lagi.`;
    return `${metric.header} ${trendLabel}; puncak di ${rows[peakIndex]?.periodLabel || "periode puncak"} dan titik terendah di ${rows[troughIndex]?.periodLabel || "periode terendah"}.`;
  }

  function buildChunkInsights(smartModel, metrics, group) {
    const focusMetrics = metrics.slice(0, 4);
    const eventLines = [];
    focusMetrics.forEach((metric) => {
      const series = getMetricSeries(smartModel, metric);
      const events = detectSeriesEvents(series, smartModel.groupedRows);
      if (events.extremeUps.length) eventLines.push(`${metric.header} mengalami spike pada ${events.extremeUps.join(" & ")}.`);
      if (events.missing.length) eventLines.push(`${metric.header} punya data missing pada ${events.missing.join(" & ")}.`);
      if (events.zeros.length) eventLines.push(`${metric.header} menyentuh nilai 0 pada ${events.zeros.join(" & ")}.`);
      if (events.negatives.length) eventLines.push(`${metric.header} negatif pada ${events.negatives.join(" & ")}.`);
    });
    const patternLine = buildGroupPatternInsight(smartModel, focusMetrics, group);
    const conclusion = buildGroupConclusion(smartModel, focusMetrics);
    const segmentLine = ["marketing", "customer", "revenue", "general"].includes(group?.context) ? (smartModel.segmentInsights?.[0] || "") : "";
    return [patternLine, segmentLine, ...dedupeInsights(eventLines).slice(0, 2), `Kesimpulan: ${conclusion}`].filter(Boolean);
  }

  function trendStrengthLabel(values) {
    const numeric = values.filter((value) => value !== null && Number.isFinite(value));
    if (numeric.length < 2) return "rendah";
    let movement = 0;
    for (let index = 1; index < numeric.length; index += 1) movement += Math.abs(numeric[index] - numeric[index - 1]);
    const net = Math.abs(numeric[numeric.length - 1] - numeric[0]);
    const ratio = movement ? net / movement : 0;
    if (ratio >= 0.7) return "kuat";
    if (ratio >= 0.35) return "sedang";
    return "lemah";
  }

  function buildCorrelationCard(smartModel, metrics) {
    const pair = findBestCorrelationPair(smartModel, metrics);
    if (!pair) return null;
    const canvas = buildPreparedChartCanvas({
      type: "scatter",
      labels: [],
      series: [{
        name: `${pair.left.header} vs ${pair.right.header}`,
        values: pair.points,
        color: "#7c3aed",
      }],
      xLabel: pair.left.header,
      yLabel: pair.right.header,
      palette: ["#7c3aed"],
    }, { title: "Correlation Chart", subtitle: `Korelasi ${pair.label}` }, 1160, 540);
    const filename = "correlation-chart";
    const card = document.createElement("section");
    card.className = "chart-preview-card";
    card.innerHTML = `<div class="chart-preview-card-title">Correlation Chart</div>`;
    card.appendChild(canvas);
    card.insertAdjacentHTML("beforeend", `<div class="chart-insight-box"><strong>Insight</strong><ul class="tool-list"><li>${pair.left.header} dan ${pair.right.header} memiliki korelasi ${pair.label} (${pair.score.toFixed(2)}).</li></ul></div>`);
    card.insertAdjacentHTML("beforeend", `
      <div class="action-row compact-actions">
        <button class="button secondary-button" type="button" data-chart-download="${filename}" data-chart-format="png">PNG</button>
        <button class="button secondary-button" type="button" data-chart-download="${filename}" data-chart-format="jpg">JPG</button>
        <button class="button secondary-button" type="button" data-chart-download="${filename}" data-chart-format="webp">WEBP</button>
        <button class="button secondary-button" type="button" data-chart-download="${filename}" data-chart-format="pdf">PDF</button>
      </div>
    `);
    return { card, canvas, filename, title: "Correlation Chart", metrics: [pair.left, pair.right] };
  }

  function findBestCorrelationPair(smartModel, metrics) {
    let best = null;
    for (let leftIndex = 0; leftIndex < metrics.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < metrics.length; rightIndex += 1) {
        const left = metrics[leftIndex];
        const right = metrics[rightIndex];
        const pairs = smartModel.groupedRows
          .map((row) => ({ x: row.values[left.index], y: row.values[right.index], label: row.periodLabel }))
          .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
        if (pairs.length < 3) continue;
        const score = pearsonCorrelation(pairs.map((point) => point.x), pairs.map((point) => point.y));
        if (!Number.isFinite(score) || Math.abs(score) < 0.6) continue;
        if (!best || Math.abs(score) > Math.abs(best.score)) best = { left, right, score, points: pairs, label: score > 0 ? "positif kuat" : "negatif kuat" };
      }
    }
    return best;
  }

  function pearsonCorrelation(left, right) {
    const count = Math.min(left.length, right.length);
    if (count < 2) return Number.NaN;
    const meanLeft = left.reduce((sum, value) => sum + value, 0) / count;
    const meanRight = right.reduce((sum, value) => sum + value, 0) / count;
    let numerator = 0;
    let denomLeft = 0;
    let denomRight = 0;
    for (let index = 0; index < count; index += 1) {
      const deltaLeft = left[index] - meanLeft;
      const deltaRight = right[index] - meanRight;
      numerator += deltaLeft * deltaRight;
      denomLeft += deltaLeft ** 2;
      denomRight += deltaRight ** 2;
    }
    const denominator = Math.sqrt(denomLeft * denomRight);
    return denominator ? numerator / denominator : Number.NaN;
  }

  function detectSeriesEvents(series, rows) {
    const details = { extremeUps: [], zeros: [], negatives: [], extremeDowns: [], missing: [] };
    let previousNumeric = null;
    for (let index = 0; index < series.length; index += 1) {
      const period = rows[index]?.periodLabel || `periode ${index + 1}`;
      const rawCurrent = series[index];
      if (!Number.isFinite(rawCurrent)) {
        details.missing.push(period);
        continue;
      }
      const current = Number(rawCurrent);
      if (current === 0) details.zeros.push(period);
      if (current < 0) details.negatives.push(period);
      if (previousNumeric === null) {
        previousNumeric = current;
        continue;
      }
      const baseline = Math.max(Math.abs(previousNumeric), 1);
      const deltaRatio = (current - previousNumeric) / baseline;
      if (deltaRatio >= 0.8) details.extremeUps.push(period);
      if (deltaRatio <= -0.45) details.extremeDowns.push(period);
      previousNumeric = current;
    }
    return details;
  }

  function dedupeInsights(lines) {
    return [...new Set(lines.filter(Boolean))];
  }

  function buildGroupPatternInsight(smartModel, metrics, group) {
    if (!metrics.length) return "";
    const names = metrics.map((metric) => metric.header).join(", ");
    const directionScore = metrics.reduce((sum, metric) => sum + seriesTrend(interpolateSeries(getMetricSeries(smartModel, metric))), 0);
    const label = directionScore > 0 ? "cenderung naik" : directionScore < 0 ? "cenderung turun" : "fluktuatif";
    const decisionLine = buildDecisionReadyInsight(smartModel, metrics, group);
    if (decisionLine) return decisionLine;
    if (group?.context === "marketing") return `Biaya marketing (${names}) ${label} dan menunjukkan pola perubahan biaya yang saling terkait.`;
    if (group?.context === "customer") return `Customer Performance (${names}) dibaca dalam satu chart agar hubungan KPI pelanggan terlihat lebih jelas dan tidak terpecah.`;
    if (group?.context === "revenue") return `Revenue dan metrik terkait ${label} dengan perubahan yang paling penting untuk dipantau.`;
    return `${group?.label || "Performa grup"} (${names}) ${label}.`;
  }

  function buildGroupConclusion(smartModel, metrics) {
    const allEvents = metrics.flatMap((metric) => {
      const series = getMetricSeries(smartModel, metric);
      const events = detectSeriesEvents(series, smartModel.groupedRows);
      return [...events.extremeUps, ...events.extremeDowns, ...events.zeros, ...events.negatives, ...events.missing];
    });
    if (allEvents.length >= 3) return "Performa fluktuatif dengan beberapa anomali signifikan.";
    if (allEvents.length >= 1) return "Performa cukup dinamis dengan beberapa titik yang perlu perhatian.";
    return "Performa relatif stabil tanpa anomali besar.";
  }

  function buildDecisionReadyInsight(smartModel, metrics, group) {
    const allMetrics = smartModel.groups.flatMap((item) => item.metrics);
    const revenueMetric = metrics.find((metric) => metric.context === "revenue") || allMetrics.find((metric) => metric.context === "revenue");
    const marketingMetric = metrics.find((metric) => metric.context === "marketing") || allMetrics.find((metric) => metric.context === "marketing");
    if (!revenueMetric || !marketingMetric) {
      if (group?.context === "revenue" && revenueMetric) {
        const revenueGrowthOnly = calculateGrowthPct(interpolateSeries(getMetricSeries(smartModel, revenueMetric)));
        return `${revenueMetric.header} ${revenueGrowthOnly >= 0 ? "naik" : "turun"} ${Math.abs(revenueGrowthOnly).toFixed(1)}% dengan tren ${trendStrengthLabel(getMetricSeries(smartModel, revenueMetric))}.`;
      }
      return "";
    }
    const revenueGrowth = calculateGrowthPct(interpolateSeries(getMetricSeries(smartModel, revenueMetric)));
    const marketingGrowth = calculateGrowthPct(interpolateSeries(getMetricSeries(smartModel, marketingMetric)));
    if (marketingGrowth > 0 && revenueGrowth > 0) {
      const ratio = revenueGrowth / Math.max(marketingGrowth, 1);
      const verdict = ratio >= 1.25 ? "efisien" : ratio >= 0.9 ? "cukup seimbang" : "mulai kurang efisien";
      return `${marketingMetric.header} naik ${marketingGrowth.toFixed(1)}%, ${revenueMetric.header} ikut naik ${revenueGrowth.toFixed(1)}% sehingga pergerakannya ${verdict}.`;
    }
    if (marketingGrowth > 0 && revenueGrowth <= 0) return `${marketingMetric.header} naik ${marketingGrowth.toFixed(1)}% tetapi ${revenueMetric.header} belum ikut menguat, sehingga efisiensi perlu ditinjau.`;
    return "";
  }

  function calculateGrowthPct(values) {
    const first = firstNumericValue(values);
    const last = lastNumericValue(values);
    if (!Number.isFinite(first) || !Number.isFinite(last) || Math.abs(first) < 1e-6) return 0;
    return ((last - first) / Math.abs(first)) * 100;
  }

  function getMetricSeries(smartModel, metric) {
    return smartModel.groupedRows.map((row) => (Number.isFinite(row.values[metric.index]) ? Number(row.values[metric.index]) : null));
  }

  function firstNumericValue(values) {
    return values.find((value) => value !== null && Number.isFinite(value)) ?? 0;
  }

  function lastNumericValue(values) {
    const numeric = values.filter((value) => value !== null && Number.isFinite(value));
    return numeric.length ? numeric[numeric.length - 1] : 0;
  }

  function interpolateSeries(values) {
    const result = [...values];
    let lastKnownIndex = null;
    for (let index = 0; index < result.length; index += 1) {
      if (!Number.isFinite(result[index])) continue;
      if (lastKnownIndex !== null && index - lastKnownIndex > 1) {
        const start = result[lastKnownIndex];
        const end = result[index];
        const gap = index - lastKnownIndex;
        for (let fillIndex = 1; fillIndex < gap; fillIndex += 1) {
          result[lastKnownIndex + fillIndex] = start + ((end - start) * (fillIndex / gap));
        }
      }
      lastKnownIndex = index;
    }
    return result;
  }

  function buildSmartChunkParsed(smartModel, metricChunk) {
    return {
      headers: [smartModel.periodHeader, ...metricChunk.map((metric) => metric.header)],
      rows: smartModel.groupedRows.map((row) => [row.periodLabel, ...metricChunk.map((metric) => row.values[metric.index] ?? "—")]),
      dataRows: smartModel.groupedRows.map((row) => [row.periodLabel, ...metricChunk.map((metric) => row.values[metric.index] ?? null)]),
      columnTypes: ["Periode", ...metricChunk.map((metric) => metricTypeBadge(metric.kind))],
    };
  }

  function chunkArray(items, size) {
    const result = [];
    for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
    return result;
  }

  function combineChartCanvases(canvases) {
    if (canvases.length === 1) return canvases[0];
    const gap = 28;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(...canvases.map((item) => item.width));
    canvas.height = canvases.reduce((sum, item) => sum + item.height, 0) + gap * (canvases.length - 1);
    const context = canvas.getContext("2d");
    context.fillStyle = "#f8fafc";
    context.fillRect(0, 0, canvas.width, canvas.height);
    let offsetY = 0;
    canvases.forEach((item, index) => {
      context.drawImage(item, (canvas.width - item.width) / 2, offsetY);
      offsetY += item.height + (index < canvases.length - 1 ? gap : 0);
    });
    return canvas;
  }

  function prepareChartSeries(parsed, requestedType) {
    const headers = parsed.headers;
    const rows = parsed.dataRows;
    const palette = ["#e6672e", "#0f8b8d", "#3b82f6", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
    const numericIndexes = headers
      .map((_, index) => rows.some((row) => typeof row[index] === "number" && Number.isFinite(row[index])) ? index : -1)
      .filter((index) => index >= 0);
    const firstColumnLabel = rows.every((row) => typeof row[0] !== "number");
    const labelIndex = firstColumnLabel ? 0 : null;
    const chartType = requestedType || "bar";

    if ((chartType === "pie" || chartType === "donut") && labelIndex !== null && numericIndexes.length) {
      const valueIndex = numericIndexes.find((index) => index !== labelIndex) ?? numericIndexes[0];
      return {
        type: chartType,
        labels: rows.map((row) => String(row[labelIndex])),
        series: [{ name: headers[valueIndex], values: rows.map((row) => Number(row[valueIndex]) || 0), color: palette[0] }],
        palette,
      };
    }

    if (chartType === "scatter") {
      const [xIndex, yIndex] = numericIndexes;
      if (xIndex === undefined || yIndex === undefined) return null;
      return {
        type: "scatter",
        labels: [],
        series: [{ name: `${headers[xIndex]} vs ${headers[yIndex]}`, values: rows.map((row) => ({ x: Number(row[xIndex]) || 0, y: Number(row[yIndex]) || 0, label: String(row[labelIndex ?? 0] ?? "") })), color: palette[0] }],
        xLabel: headers[xIndex],
        yLabel: headers[yIndex],
        palette,
      };
    }

    if (chartType === "bubble") {
      const [xIndex, yIndex, sizeIndex] = numericIndexes;
      if (xIndex === undefined || yIndex === undefined || sizeIndex === undefined) return null;
      return {
        type: "bubble",
        labels: [],
        series: [{ name: `${headers[xIndex]} vs ${headers[yIndex]}`, values: rows.map((row) => ({ x: Number(row[xIndex]) || 0, y: Number(row[yIndex]) || 0, size: Math.abs(Number(row[sizeIndex]) || 0), label: String(row[labelIndex ?? 0] ?? "") })), color: palette[0] }],
        xLabel: headers[xIndex],
        yLabel: headers[yIndex],
        sizeLabel: headers[sizeIndex],
        palette,
      };
    }

    const labels = labelIndex !== null ? rows.map((row) => String(row[labelIndex])) : rows.map((_, index) => `Data ${index + 1}`);
    const valueIndexes = numericIndexes.filter((index) => index !== labelIndex);
    const series = valueIndexes.map((index, seriesIndex) => ({
      name: headers[index],
      values: rows.map((row) => (typeof row[index] === "number" && Number.isFinite(row[index]) ? Number(row[index]) : null)),
      color: palette[seriesIndex % palette.length],
    }));

    if (!series.length && numericIndexes.length) {
      series.push({ name: headers[numericIndexes[0]], values: rows.map((row) => (typeof row[numericIndexes[0]] === "number" && Number.isFinite(row[numericIndexes[0]]) ? Number(row[numericIndexes[0]]) : null)), color: palette[0] });
    }
    const dualAxis = buildDualAxisConfig(series);
    return { type: chartType, labels, series, palette, dualAxis };
  }

  function drawChartCanvas(canvas, chartState, meta = {}) {
    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 90, right: 48, bottom: 90, left: 90 };
    context.clearRect(0, 0, width, height);

    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#fff9f2");
    background.addColorStop(1, "#eef6ff");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    context.fillStyle = "#0f172a";
    context.font = '700 32px "Segoe UI", Arial, sans-serif';
    context.fillText(meta.title || "Auto Chart Insight", padding.left, 50);
    context.fillStyle = "#64748b";
    context.font = '500 16px "Segoe UI", Arial, sans-serif';
    if (meta.subtitle) context.fillText(meta.subtitle, padding.left, 76);

    if (chartState.type === "pie" || chartState.type === "donut") return drawCircularChart(context, canvas, chartState, chartState.type === "donut");
    if (chartState.type === "radar") return drawRadarChart(context, canvas, chartState);
    if (chartState.type === "scatter" || chartState.type === "bubble") return drawScatterFamilyChart(context, canvas, chartState);
    drawCartesianChart(context, canvas, chartState, padding);
  }

  function drawCartesianChart(context, canvas, chartState, padding) {
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    const baseX = padding.left;
    const baseY = padding.top + chartHeight;
    const values = chartState.series.flatMap((series) => series.values).filter((value) => value !== null && Number.isFinite(value));
    const maxValue = Math.max(...values, 0);
    const minValue = Math.min(...values, 0);
    const range = Math.max(Math.abs(maxValue - minValue), 1);
    const primaryIndexes = chartState.dualAxis?.primary ?? chartState.series.map((_, index) => index);
    const secondaryIndexes = chartState.dualAxis?.secondary ?? [];
    const primaryValues = primaryIndexes.flatMap((index) => chartState.series[index]?.values || []).filter((value) => value !== null && Number.isFinite(value));
    const secondaryValues = secondaryIndexes.flatMap((index) => chartState.series[index]?.values || []).filter((value) => value !== null && Number.isFinite(value));
    const primaryMin = primaryValues.length ? Math.min(...primaryValues, 0) : minValue;
    const primaryMax = primaryValues.length ? Math.max(...primaryValues, 0) : maxValue;
    const primaryRange = Math.max(Math.abs(primaryMax - primaryMin), 1);
    const secondaryMin = secondaryValues.length ? Math.min(...secondaryValues, 0) : primaryMin;
    const secondaryMax = secondaryValues.length ? Math.max(...secondaryValues, 0) : primaryMax;
    const secondaryRange = Math.max(Math.abs(secondaryMax - secondaryMin), 1);

    context.strokeStyle = "rgba(148, 163, 184, 0.28)";
    context.lineWidth = 1;
    for (let step = 0; step <= 5; step += 1) {
      const ratio = step / 5;
      const y = baseY - chartHeight * ratio;
      context.beginPath();
      context.moveTo(baseX, y);
      context.lineTo(baseX + chartWidth, y);
      context.stroke();
      context.fillStyle = "#64748b";
      context.font = '12px "Segoe UI", Arial, sans-serif';
      context.fillText(formatNumber(primaryMin + (primaryRange * ratio)), 16, y + 4);
      if (secondaryIndexes.length) {
        context.textAlign = "right";
        context.fillText(formatNumber(secondaryMin + (secondaryRange * ratio)), canvas.width - 12, y + 4);
        context.textAlign = "start";
      }
    }

    context.strokeStyle = "#94a3b8";
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(baseX, padding.top);
    context.lineTo(baseX, baseY);
    context.lineTo(baseX + chartWidth, baseY);
    context.stroke();
    if (secondaryIndexes.length) {
      context.beginPath();
      context.moveTo(baseX + chartWidth, padding.top);
      context.lineTo(baseX + chartWidth, baseY);
      context.stroke();
    }

    const categoryCount = Math.max(chartState.labels.length, 1);
    const groupWidth = chartWidth / categoryCount;
    const groupBarWidth = groupWidth * 0.72;
    const zeroY = baseY - ((0 - minValue) / range) * chartHeight;

    chartState.labels.forEach((label, index) => {
      const x = baseX + groupWidth * index + groupWidth / 2;
      const shortLabel = String(label).length > 14 ? `${String(label).slice(0, 12)}...` : String(label);
      context.fillStyle = "#475569";
      context.font = '12px "Segoe UI", Arial, sans-serif';
      context.save();
      if (chartState.type === "horizontal-bar") context.fillText(shortLabel, 12, padding.top + ((index + 0.5) * (chartHeight / categoryCount)) + 4);
      else {
        context.translate(x, baseY + 22);
        context.rotate(-Math.PI / 8);
        context.fillText(shortLabel, -28, 0);
      }
      context.restore();
    });

    if (chartState.type === "horizontal-bar") {
      const rowHeight = chartHeight / categoryCount;
      chartState.series.forEach((series, seriesIndex) => {
        series.values.forEach((value, index) => {
          const barHeight = (rowHeight * 0.72) / chartState.series.length;
          const y = padding.top + rowHeight * index + (seriesIndex * barHeight) + rowHeight * 0.14;
          const barWidth = safeRatio(value - minValue, range, 0) * chartWidth;
          context.fillStyle = series.color;
          context.globalAlpha = 0.88;
          roundRect(context, baseX, y, Math.max(4, barWidth), Math.max(12, barHeight - 4), 10);
          context.fill();
          context.globalAlpha = 1;
        });
      });
      drawChartLegend(context, chartState, canvas.width - 250, 110);
      return;
    }

    if (chartState.type === "stacked-bar") {
      chartState.labels.forEach((_, index) => {
        let accumulated = 0;
        chartState.series.forEach((series) => {
          const value = series.values[index];
          const height = safeRatio(value, Math.max(maxValue, 1), 0) * chartHeight;
          const x = baseX + groupWidth * index + (groupWidth - groupBarWidth) / 2;
          const y = baseY - accumulated - height;
          context.fillStyle = series.color;
          context.globalAlpha = 0.9;
          roundRect(context, x, y, groupBarWidth, Math.max(4, height), 12);
          context.fill();
          accumulated += height;
          context.globalAlpha = 1;
        });
      });
      drawChartLegend(context, chartState, canvas.width - 250, 110);
      return;
    }

    if (chartState.type === "line" || chartState.type === "area") {
      chartState.series.forEach((series) => {
        const markers = detectSeriesEvents(series.values, chartState.labels.map((label) => ({ periodLabel: label })));
        const axisType = secondaryIndexes.includes(chartState.series.indexOf(series)) ? "secondary" : "primary";
        const axisMin = axisType === "secondary" ? secondaryMin : primaryMin;
        const axisRange = axisType === "secondary" ? secondaryRange : primaryRange;
        context.strokeStyle = series.color;
        context.lineWidth = 3;
        context.beginPath();
        let hasStarted = false;
        series.values.forEach((value, index) => {
          if (value === null || !Number.isFinite(value)) return;
          const x = baseX + groupWidth * index + groupWidth / 2;
          const y = baseY - ((value - axisMin) / axisRange) * chartHeight;
          if (!hasStarted) {
            context.moveTo(x, y);
            hasStarted = true;
          } else {
            const prev = series.values[index - 1];
            if (prev === null || !Number.isFinite(prev)) context.moveTo(x, y);
            else context.lineTo(x, y);
          }
        });
        context.stroke();
        if (chartState.type === "area") {
          const gradient = context.createLinearGradient(0, padding.top, 0, baseY);
          gradient.addColorStop(0, `${series.color}90`);
          gradient.addColorStop(1, `${series.color}08`);
          context.fillStyle = gradient;
          context.beginPath();
          let firstPoint = null;
          let lastPoint = null;
          series.values.forEach((value, index) => {
            if (value === null || !Number.isFinite(value)) return;
            const x = baseX + groupWidth * index + groupWidth / 2;
            const y = baseY - ((value - axisMin) / axisRange) * chartHeight;
            if (!firstPoint) {
              context.moveTo(x, y);
              firstPoint = { x, y };
            } else {
              context.lineTo(x, y);
            }
            lastPoint = { x, y };
          });
          if (firstPoint && lastPoint) {
            context.lineTo(lastPoint.x, baseY);
            context.lineTo(firstPoint.x, baseY);
            context.closePath();
            context.fill();
          }
        }
        series.values.forEach((value, index) => {
          if (value === null || !Number.isFinite(value)) return;
          const x = baseX + groupWidth * index + groupWidth / 2;
          const y = baseY - ((value - axisMin) / axisRange) * chartHeight;
          context.fillStyle = "#ffffff";
          context.beginPath();
          context.arc(x, y, 5, 0, Math.PI * 2);
          context.fill();
          context.strokeStyle = series.color;
          context.lineWidth = 3;
          context.stroke();
          drawPointMarker(context, x, y, value, chartState.labels[index], markers);
        });
        markers.missing.forEach((periodLabel) => {
          const missingIndex = chartState.labels.indexOf(periodLabel);
          if (missingIndex < 0) return;
          const x = baseX + groupWidth * missingIndex + groupWidth / 2;
          drawPointMarker(context, x, baseY + 10, null, periodLabel, markers);
        });
      });
      drawChartLegend(context, chartState, canvas.width - 250, 110);
      return;
    }

    chartState.labels.forEach((_, index) => {
      chartState.series.forEach((series, seriesIndex) => {
        const totalBars = chartState.series.length;
        const barWidth = groupBarWidth / totalBars;
        const x = baseX + groupWidth * index + (groupWidth - groupBarWidth) / 2 + (seriesIndex * barWidth);
        const value = series.values[index];
        const scaled = ((value - minValue) / range) * chartHeight;
        const y = zeroY - Math.max(0, scaled);
        const height = Math.abs(scaled);
        context.fillStyle = series.color;
        context.globalAlpha = 0.88;
        roundRect(context, x, y, Math.max(8, barWidth - 6), Math.max(4, height), 12);
        context.fill();
        context.globalAlpha = 1;
      });
    });
    drawChartLegend(context, chartState, canvas.width - 250, 110);
  }

  function drawCircularChart(context, canvas, chartState, donut = false) {
    const values = chartState.series[0]?.values || [];
    const total = values.reduce((sum, value) => sum + Math.max(value, 0), 0);
    const centerX = canvas.width * 0.36;
    const centerY = canvas.height * 0.5;
    const radius = Math.min(canvas.width, canvas.height) * 0.24;
    let startAngle = -Math.PI / 2;
    values.forEach((value, index) => {
      const angle = total ? (value / total) * Math.PI * 2 : 0;
      context.beginPath();
      context.moveTo(centerX, centerY);
      context.fillStyle = chartState.palette[index % chartState.palette.length];
      context.arc(centerX, centerY, radius, startAngle, startAngle + angle);
      context.closePath();
      context.fill();
      startAngle += angle;
    });
    if (donut) {
      context.beginPath();
      context.fillStyle = "#ffffff";
      context.arc(centerX, centerY, radius * 0.56, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#0f172a";
      context.font = '700 28px "Segoe UI", Arial, sans-serif';
      context.textAlign = "center";
      context.fillText(formatNumber(total), centerX, centerY + 10);
      context.textAlign = "start";
    }
    drawCircularLegend(context, chartState, canvas.width * 0.63, 170, total);
  }

  function drawRadarChart(context, canvas, chartState) {
    const centerX = canvas.width * 0.42;
    const centerY = canvas.height * 0.5;
    const radius = Math.min(canvas.width, canvas.height) * 0.27;
    const axes = chartState.labels.length;
    const maxValue = Math.max(...chartState.series.flatMap((series) => series.values), 1);
    for (let ring = 1; ring <= 5; ring += 1) {
      context.beginPath();
      for (let axis = 0; axis < axes; axis += 1) {
        const angle = (-Math.PI / 2) + (axis / axes) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius * (ring / 5);
        const y = centerY + Math.sin(angle) * radius * (ring / 5);
        if (!axis) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
      context.strokeStyle = "rgba(148, 163, 184, 0.28)";
      context.stroke();
    }
    chartState.labels.forEach((label, axis) => {
      const angle = (-Math.PI / 2) + (axis / axes) * Math.PI * 2;
      context.fillStyle = "#475569";
      context.font = '12px "Segoe UI", Arial, sans-serif';
      context.textAlign = "center";
      context.fillText(String(label).slice(0, 14), centerX + Math.cos(angle) * (radius + 22), centerY + Math.sin(angle) * (radius + 22));
    });
    context.textAlign = "start";
    chartState.series.forEach((series) => {
      context.beginPath();
      series.values.forEach((value, axis) => {
        const angle = (-Math.PI / 2) + (axis / axes) * Math.PI * 2;
        const distance = (Math.max(value, 0) / maxValue) * radius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        if (!axis) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.closePath();
      context.fillStyle = `${series.color}33`;
      context.strokeStyle = series.color;
      context.lineWidth = 2.5;
      context.fill();
      context.stroke();
    });
    drawChartLegend(context, chartState, canvas.width - 250, 110);
  }

  function drawScatterFamilyChart(context, canvas, chartState) {
    const padding = { top: 110, right: 80, bottom: 90, left: 90 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    const points = chartState.series[0]?.values || [];
    const maxX = Math.max(...points.map((point) => point.x), 1);
    const maxY = Math.max(...points.map((point) => point.y), 1);
    const maxSize = Math.max(...points.map((point) => point.size || 1), 1);

    context.strokeStyle = "#94a3b8";
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(padding.left, padding.top);
    context.lineTo(padding.left, padding.top + chartHeight);
    context.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    context.stroke();

    for (let step = 0; step <= 5; step += 1) {
      const x = padding.left + (chartWidth * step) / 5;
      const y = padding.top + chartHeight - (chartHeight * step) / 5;
      context.strokeStyle = "rgba(148, 163, 184, 0.22)";
      context.beginPath();
      context.moveTo(x, padding.top);
      context.lineTo(x, padding.top + chartHeight);
      context.moveTo(padding.left, y);
      context.lineTo(padding.left + chartWidth, y);
      context.stroke();
    }

    points.forEach((point, index) => {
      const x = padding.left + (point.x / maxX) * chartWidth;
      const y = padding.top + chartHeight - (point.y / maxY) * chartHeight;
      const radius = chartState.type === "bubble" ? 8 + ((point.size || 1) / maxSize) * 28 : 8;
      context.fillStyle = `${chartState.series[0].color}${chartState.type === "bubble" ? "66" : "cc"}`;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = chartState.series[0].color;
      context.lineWidth = 2;
      context.stroke();
      if (index < 12 && point.label) {
        context.fillStyle = "#334155";
        context.font = '12px "Segoe UI", Arial, sans-serif';
        context.fillText(point.label.slice(0, 12), x + radius + 4, y - 4);
      }
    });

    context.fillStyle = "#475569";
    context.font = '700 14px "Segoe UI", Arial, sans-serif';
    context.fillText(chartState.xLabel || "X", canvas.width / 2 - 20, canvas.height - 28);
    context.save();
    context.translate(24, canvas.height / 2 + 10);
    context.rotate(-Math.PI / 2);
    context.fillText(chartState.yLabel || "Y", 0, 0);
    context.restore();
    drawChartLegend(context, chartState, canvas.width - 250, 110, chartState.sizeLabel ? [`Ukuran bubble: ${chartState.sizeLabel}`] : []);
  }

  function drawChartLegend(context, chartState, x, y, extraLines = []) {
    context.fillStyle = "rgba(255,255,255,0.88)";
    roundRect(context, x - 18, y - 24, 220, 46 + (chartState.series.length + extraLines.length) * 28, 18);
    context.fill();
    context.fillStyle = "#0f172a";
    context.font = '700 16px "Segoe UI", Arial, sans-serif';
    context.fillText("Legenda", x, y);
    chartState.series.forEach((series, index) => {
      const top = y + 26 + index * 28;
      context.fillStyle = series.color;
      roundRect(context, x, top - 12, 18, 18, 6);
      context.fill();
      context.fillStyle = "#334155";
      context.font = '13px "Segoe UI", Arial, sans-serif';
      context.fillText(series.name, x + 28, top + 2);
    });
    extraLines.forEach((line, index) => {
      context.fillStyle = "#64748b";
      context.font = '12px "Segoe UI", Arial, sans-serif';
      context.fillText(line, x, y + 26 + (chartState.series.length + index) * 28);
    });
  }

  function drawCircularLegend(context, chartState, x, y, total) {
    context.fillStyle = "rgba(255,255,255,0.88)";
    roundRect(context, x - 20, y - 30, 300, 58 + chartState.labels.length * 28, 18);
    context.fill();
    context.fillStyle = "#0f172a";
    context.font = '700 16px "Segoe UI", Arial, sans-serif';
    context.fillText("Komposisi", x, y);
    chartState.labels.forEach((label, index) => {
      const value = chartState.series[0].values[index] || 0;
      const percent = total ? Math.round((value / total) * 1000) / 10 : 0;
      const top = y + 28 + index * 28;
      context.fillStyle = chartState.palette[index % chartState.palette.length];
      roundRect(context, x, top - 12, 18, 18, 6);
      context.fill();
      context.fillStyle = "#334155";
      context.font = '13px "Segoe UI", Arial, sans-serif';
      context.fillText(`${label}: ${formatNumber(value)} (${percent}%)`, x + 28, top + 2);
    });
  }

  function roundRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function prettyChartType(type) {
    const names = {
      bar: "Bar Chart",
      "horizontal-bar": "Horizontal Bar",
      line: "Line Chart",
      area: "Area Chart",
      pie: "Pie Chart",
      donut: "Donut Chart",
      radar: "Radar Chart",
      scatter: "Scatter Chart",
      bubble: "Bubble Chart",
      "stacked-bar": "Stacked Bar",
    };
    return names[type] || type;
  }

  function renderBmi() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Tinggi (cm)</span><input class="tool-input" id="bmi-height" type="number" min="50" max="260" value="170"></label><label class="tool-field"><span class="tool-label">Berat (kg)</span><input class="tool-input" id="bmi-weight" type="number" min="10" max="350" value="65"></label></div><div class="action-row"><button class="button button-primary" id="bmi-run" type="button">Hitung BMI</button></div><div class="result-card"><div class="metric-highlight" id="bmi-result">-</div><p id="bmi-category" class="small-note">Kategori IMT standar Indonesia akan muncul di sini.</p></div>`;
    document.querySelector("#bmi-run").addEventListener("click", () => {
      const height = Number(document.querySelector("#bmi-height").value) / 100;
      const weight = Number(document.querySelector("#bmi-weight").value);
      const bmi = weight / (height * height);
      let category = "Obesitas";
      if (bmi < 18.5) category = "Berat badan kurang";
      else if (bmi <= 25) category = "Normal";
      else if (bmi <= 27) category = "Berat badan berlebih";
      document.querySelector("#bmi-result").textContent = bmi.toFixed(1);
      document.querySelector("#bmi-category").textContent = `Kategori IMT Indonesia: ${category}`;
      setStatus("BMI berhasil dihitung dengan standar Indonesia.");
    });
  }

  function renderDiscount() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Harga awal</span><input class="tool-input" id="discount-price" type="number" min="0" value="100000"></label><label class="tool-field"><span class="tool-label">Diskon (%)</span><input class="tool-input" id="discount-rate" type="number" min="0" max="100" value="20"></label><label class="tool-field"><span class="tool-label">Pajak (%)</span><input class="tool-input" id="discount-tax" type="number" min="0" max="100" value="0"></label></div><div class="action-row"><button class="button button-primary" id="discount-run" type="button">Hitung Harga Akhir</button></div><div class="stats-grid" id="discount-stats"></div>`;
    document.querySelector("#discount-run").addEventListener("click", () => {
      const price = Number(document.querySelector("#discount-price").value);
      const rate = Number(document.querySelector("#discount-rate").value) / 100;
      const tax = Number(document.querySelector("#discount-tax").value) / 100;
      const discountValue = price * rate;
      const afterDiscount = price - discountValue;
      const finalValue = afterDiscount + afterDiscount * tax;
      document.querySelector("#discount-stats").innerHTML = [["Potongan", `Rp ${formatNumber(discountValue)}`], ["Setelah Diskon", `Rp ${formatNumber(afterDiscount)}`], ["Harga Akhir", `Rp ${formatNumber(finalValue)}`]].map(([label, value]) => `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`).join("");
      setStatus("Harga akhir berhasil dihitung.");
    });
  }

  function renderPercentage() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">Mode hitung</span><select class="tool-select" id="percentage-mode"><option value="of">Berapa hasil X% dari Y</option><option value="change">Berapa persen perubahan dari A ke B</option><option value="portion">X adalah berapa persen dari Y</option></select></label><label class="tool-field"><span class="tool-label">Nilai A / X</span><input class="tool-input" id="percentage-a" type="number" value="25"></label><label class="tool-field"><span class="tool-label">Nilai B / Y</span><input class="tool-input" id="percentage-b" type="number" value="200"></label></div><div class="action-row"><button class="button button-primary" id="percentage-run" type="button">Hitung Persentase</button></div><div class="result-card"><div class="metric-highlight" id="percentage-result">-</div></div>`;
    document.querySelector("#percentage-run").addEventListener("click", () => {
      const mode = document.querySelector("#percentage-mode").value;
      const a = Number(document.querySelector("#percentage-a").value);
      const b = Number(document.querySelector("#percentage-b").value);
      let result = 0;
      if (mode === "of") result = (a / 100) * b;
      if (mode === "change") result = ((b - a) / a) * 100;
      if (mode === "portion") result = (a / b) * 100;
      document.querySelector("#percentage-result").textContent = mode === "of" ? formatNumber(result) : `${formatNumber(result)}%`;
      setStatus("Perhitungan persentase selesai.");
    });
  }

  function renderLoanCicilan() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Jumlah pinjaman</span><input class="tool-input" id="loan-principal" type="number" min="0" value="100000000"></label><label class="tool-field"><span class="tool-label">Bunga per tahun (%)</span><input class="tool-input" id="loan-rate" type="number" min="0" step="0.01" value="10"></label><label class="tool-field"><span class="tool-label">Tenor (bulan)</span><input class="tool-input" id="loan-months" type="number" min="1" value="24"></label></div><div class="action-row"><button class="button button-primary" id="loan-run" type="button">Hitung Cicilan</button></div><div class="stats-grid" id="loan-stats"></div>`;
    document.querySelector("#loan-run").addEventListener("click", () => {
      const principal = Number(document.querySelector("#loan-principal").value);
      const annualRate = Number(document.querySelector("#loan-rate").value);
      const months = Number(document.querySelector("#loan-months").value);
      if (principal <= 0 || months <= 0) return setStatus("Isi jumlah pinjaman dan tenor dengan benar.", "warn");
      const monthlyRate = annualRate / 100 / 12;
      const monthlyPayment = monthlyRate > 0
        ? principal * (monthlyRate * (1 + monthlyRate) ** months) / (((1 + monthlyRate) ** months) - 1)
        : principal / months;
      const totalPayment = monthlyPayment * months;
      const totalInterest = totalPayment - principal;
      document.querySelector("#loan-stats").innerHTML = [["Cicilan / bulan", formatCurrency(monthlyPayment, "IDR", 0)], ["Total bunga", formatCurrency(totalInterest, "IDR", 0)], ["Total pembayaran", formatCurrency(totalPayment, "IDR", 0)]].map(([label, value]) => `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`).join("");
      setStatus("Estimasi cicilan bulanan berhasil dihitung.");
    });
  }

  function renderCurrencyConverter() {
    const options = Object.keys(CURRENCY_RATES).map((code) => `<option value="${code}">${code}</option>`).join("");
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Jumlah</span><input class="tool-input" id="currency-amount" type="number" min="0" step="0.01" value="100000"></label><label class="tool-field"><span class="tool-label">Dari</span><select class="tool-select" id="currency-from">${options}</select></label><label class="tool-field"><span class="tool-label">Ke</span><select class="tool-select" id="currency-to">${options}</select></label><label class="tool-field full"><span class="tool-label">Catatan kurs</span><div class="result-card"><p class="small-note">Kurs referensi statis untuk kalkulasi cepat, bukan kurs live.</p></div></label></div><div class="action-row"><button class="button button-primary" id="currency-run" type="button">Konversi</button><button class="button secondary-button" id="currency-swap" type="button">Tukar Mata Uang</button></div><div class="result-card"><div class="metric-highlight" id="currency-result">-</div><p class="small-note" id="currency-note">Pilih mata uang asal dan tujuan lalu tekan konversi.</p></div>`;
    document.querySelector("#currency-from").value = "IDR";
    document.querySelector("#currency-to").value = "USD";
    const run = () => {
      const amount = Number(document.querySelector("#currency-amount").value);
      const from = document.querySelector("#currency-from").value;
      const to = document.querySelector("#currency-to").value;
      if (amount < 0) return setStatus("Jumlah tidak boleh negatif.", "warn");
      const converted = convertCurrency(amount, from, to);
      document.querySelector("#currency-result").textContent = formatCurrency(converted, to, to === "JPY" ? 0 : 2);
      document.querySelector("#currency-note").textContent = `${formatCurrency(amount, from, from === "JPY" ? 0 : 2)} ≈ ${formatCurrency(converted, to, to === "JPY" ? 0 : 2)}`;
      setStatus("Konversi mata uang selesai.");
    };
    document.querySelector("#currency-run").addEventListener("click", run);
    document.querySelector("#currency-swap").addEventListener("click", () => {
      const from = document.querySelector("#currency-from");
      const to = document.querySelector("#currency-to");
      const current = from.value;
      from.value = to.value;
      to.value = current;
      run();
    });
    run();
  }

  function renderUnitConverter() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Kategori</span><select class="tool-select" id="unit-category"><option value="length">Panjang</option><option value="weight">Berat</option><option value="temperature">Suhu</option></select></label><label class="tool-field"><span class="tool-label">Nilai</span><input class="tool-input" id="unit-value" type="number" step="0.01" value="1"></label><label class="tool-field"><span class="tool-label">Dari</span><select class="tool-select" id="unit-from"></select></label><label class="tool-field"><span class="tool-label">Ke</span><select class="tool-select" id="unit-to"></select></label></div><div class="action-row"><button class="button button-primary" id="unit-run" type="button">Konversi Satuan</button></div><div class="result-card"><div class="metric-highlight" id="unit-result">-</div><p class="small-note" id="unit-note">Pilih kategori dan satuan yang ingin dikonversi.</p></div>`;
    const categoryEl = document.querySelector("#unit-category");
    const fromEl = document.querySelector("#unit-from");
    const toEl = document.querySelector("#unit-to");
    const fillOptions = () => {
      const entries = Object.entries(UNIT_OPTIONS[categoryEl.value]);
      const markup = entries.map(([value, item]) => `<option value="${value}">${item.label}</option>`).join("");
      fromEl.innerHTML = markup;
      toEl.innerHTML = markup;
      if (categoryEl.value === "length") {
        fromEl.value = "meter";
        toEl.value = "kilometer";
      } else if (categoryEl.value === "weight") {
        fromEl.value = "kilogram";
        toEl.value = "gram";
      } else {
        fromEl.value = "celsius";
        toEl.value = "fahrenheit";
      }
    };
    const run = () => {
      const category = categoryEl.value;
      const value = Number(document.querySelector("#unit-value").value);
      const from = fromEl.value;
      const to = toEl.value;
      const result = convertUnit(category, value, from, to);
      document.querySelector("#unit-result").textContent = formatNumber(result, 6);
      document.querySelector("#unit-note").textContent = `${formatNumber(value, 6)} ${UNIT_OPTIONS[category][from].label} = ${formatNumber(result, 6)} ${UNIT_OPTIONS[category][to].label}`;
      setStatus("Konversi satuan selesai.");
    };
    categoryEl.addEventListener("change", fillOptions);
    document.querySelector("#unit-run").addEventListener("click", run);
    fillOptions();
    run();
  }

  function renderTaxCalculator() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">Mode</span><select class="tool-select" id="tax-mode"><option value="exclusive">Harga belum termasuk pajak</option><option value="inclusive">Harga sudah termasuk pajak</option></select></label><label class="tool-field"><span class="tool-label">Nilai harga</span><input class="tool-input" id="tax-amount" type="number" min="0" value="100000"></label><label class="tool-field"><span class="tool-label">Tarif pajak (%)</span><input class="tool-input" id="tax-rate" type="number" min="0" step="0.01" value="11"></label></div><div class="action-row"><button class="button button-primary" id="tax-run" type="button">Hitung Pajak</button></div><div class="stats-grid" id="tax-stats"></div>`;
    document.querySelector("#tax-run").addEventListener("click", () => {
      const mode = document.querySelector("#tax-mode").value;
      const amount = Number(document.querySelector("#tax-amount").value);
      const rate = Number(document.querySelector("#tax-rate").value) / 100;
      if (amount < 0 || rate < 0) return setStatus("Nilai harga dan pajak harus valid.", "warn");
      const base = mode === "exclusive" ? amount : amount / (1 + rate);
      const tax = mode === "exclusive" ? amount * rate : amount - base;
      const total = mode === "exclusive" ? amount + tax : amount;
      document.querySelector("#tax-stats").innerHTML = [["Dasar pengenaan", formatCurrency(base, "IDR", 0)], ["Nilai pajak", formatCurrency(tax, "IDR", 0)], ["Total akhir", formatCurrency(total, "IDR", 0)]].map(([label, value]) => `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`).join("");
      setStatus("Perhitungan pajak selesai.");
    });
  }

  function renderProfitMargin() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Harga modal</span><input class="tool-input" id="profit-cost" type="number" min="0" value="50000"></label><label class="tool-field"><span class="tool-label">Harga jual</span><input class="tool-input" id="profit-sale" type="number" min="0" value="75000"></label></div><div class="action-row"><button class="button button-primary" id="profit-run" type="button">Hitung Profit</button></div><div class="stats-grid" id="profit-stats"></div>`;
    document.querySelector("#profit-run").addEventListener("click", () => {
      const cost = Number(document.querySelector("#profit-cost").value);
      const sale = Number(document.querySelector("#profit-sale").value);
      if (cost < 0 || sale < 0 || sale < cost) return setStatus("Harga jual harus lebih besar atau sama dengan modal.", "warn");
      const profit = sale - cost;
      const margin = sale ? (profit / sale) * 100 : 0;
      const markup = cost ? (profit / cost) * 100 : 0;
      document.querySelector("#profit-stats").innerHTML = [["Profit", formatCurrency(profit, "IDR", 0)], ["Margin", `${formatNumber(margin)}%`], ["Markup", `${formatNumber(markup)}%`]].map(([label, value]) => `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`).join("");
      setStatus("Profit dan margin berhasil dihitung.");
    });
  }

  function renderTipCalculator() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Total tagihan</span><input class="tool-input" id="tip-bill" type="number" min="0" value="250000"></label><label class="tool-field"><span class="tool-label">Tip (%)</span><input class="tool-input" id="tip-rate" type="number" min="0" step="0.01" value="10"></label><label class="tool-field"><span class="tool-label">Jumlah orang</span><input class="tool-input" id="tip-people" type="number" min="1" value="2"></label></div><div class="action-row"><button class="button button-primary" id="tip-run" type="button">Hitung Tip</button></div><div class="stats-grid" id="tip-stats"></div>`;
    document.querySelector("#tip-run").addEventListener("click", () => {
      const bill = Number(document.querySelector("#tip-bill").value);
      const rate = Number(document.querySelector("#tip-rate").value) / 100;
      const people = Number(document.querySelector("#tip-people").value);
      if (bill < 0 || people <= 0) return setStatus("Total tagihan dan jumlah orang harus valid.", "warn");
      const tip = bill * rate;
      const total = bill + tip;
      const perPerson = total / people;
      document.querySelector("#tip-stats").innerHTML = [["Nilai tip", formatCurrency(tip, "IDR", 0)], ["Total bayar", formatCurrency(total, "IDR", 0)], ["Per orang", formatCurrency(perPerson, "IDR", 0)]].map(([label, value]) => `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`).join("");
      setStatus("Tip dan pembagian tagihan berhasil dihitung.");
    });
  }

  function renderSimpleInterest() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Pokok awal</span><input class="tool-input" id="simple-principal" type="number" min="0" value="10000000"></label><label class="tool-field"><span class="tool-label">Rate tahunan (%)</span><input class="tool-input" id="simple-rate" type="number" min="0" step="0.01" value="6"></label><label class="tool-field"><span class="tool-label">Durasi (tahun)</span><input class="tool-input" id="simple-years" type="number" min="0" step="0.1" value="3"></label></div><div class="action-row"><button class="button button-primary" id="simple-run" type="button">Hitung Bunga</button></div><div class="stats-grid" id="simple-stats"></div>`;
    document.querySelector("#simple-run").addEventListener("click", () => {
      const principal = Number(document.querySelector("#simple-principal").value);
      const rate = Number(document.querySelector("#simple-rate").value) / 100;
      const years = Number(document.querySelector("#simple-years").value);
      if (principal < 0 || rate < 0 || years < 0) return setStatus("Isi nilai pokok, rate, dan durasi yang valid.", "warn");
      const interest = principal * rate * years;
      const maturity = principal + interest;
      document.querySelector("#simple-stats").innerHTML = [["Bunga sederhana", formatCurrency(interest, "IDR", 0)], ["Total akhir", formatCurrency(maturity, "IDR", 0)], ["Rata-rata / tahun", formatCurrency(years ? interest / years : 0, "IDR", 0)]].map(([label, value]) => `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`).join("");
      setStatus("Bunga sederhana berhasil dihitung.");
    });
  }

  function renderCompoundInterest() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Pokok awal</span><input class="tool-input" id="compound-principal" type="number" min="0" value="10000000"></label><label class="tool-field"><span class="tool-label">Rate tahunan (%)</span><input class="tool-input" id="compound-rate" type="number" min="0" step="0.01" value="8"></label><label class="tool-field"><span class="tool-label">Durasi (tahun)</span><input class="tool-input" id="compound-years" type="number" min="0" step="0.1" value="5"></label><label class="tool-field"><span class="tool-label">Setoran rutin / periode</span><input class="tool-input" id="compound-contribution" type="number" min="0" value="500000"></label><label class="tool-field"><span class="tool-label">Compounding</span><select class="tool-select" id="compound-frequency"><option value="12">Bulanan</option><option value="4">Kuartalan</option><option value="2">Semesteran</option><option value="1">Tahunan</option></select></label></div><div class="action-row"><button class="button button-primary" id="compound-run" type="button">Hitung Bunga Majemuk</button></div><div class="stats-grid" id="compound-stats"></div>`;
    document.querySelector("#compound-run").addEventListener("click", () => {
      const principal = Number(document.querySelector("#compound-principal").value);
      const annualRate = Number(document.querySelector("#compound-rate").value) / 100;
      const years = Number(document.querySelector("#compound-years").value);
      const contribution = Number(document.querySelector("#compound-contribution").value);
      const frequency = Number(document.querySelector("#compound-frequency").value);
      if (principal < 0 || annualRate < 0 || years < 0 || contribution < 0 || frequency <= 0) return setStatus("Isi data investasi dengan benar.", "warn");
      const periods = Math.round(years * frequency);
      const periodicRate = annualRate / frequency;
      let futureValue = principal;
      for (let index = 0; index < periods; index += 1) {
        futureValue = (futureValue * (1 + periodicRate)) + contribution;
      }
      const invested = principal + (contribution * periods);
      const interest = futureValue - invested;
      document.querySelector("#compound-stats").innerHTML = [["Nilai akhir", formatCurrency(futureValue, "IDR", 0)], ["Total setoran", formatCurrency(invested, "IDR", 0)], ["Total bunga", formatCurrency(interest, "IDR", 0)]].map(([label, value]) => `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`).join("");
      setStatus("Simulasi bunga majemuk selesai.");
    });
  }

  function renderAgeCalculator() {
    const today = new Date();
    const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Tanggal lahir</span><input class="tool-input" id="age-birth" type="date" value="1995-01-01"></label><label class="tool-field"><span class="tool-label">Hitung sampai</span><input class="tool-input" id="age-target" type="date" value="${todayValue}"></label></div><div class="action-row"><button class="button button-primary" id="age-run" type="button">Hitung Umur</button></div><div class="stats-grid" id="age-stats"></div><div class="result-card"><p class="small-note" id="age-note">Masukkan tanggal lahir untuk melihat umur detail.</p></div>`;
    const run = () => {
      const birth = document.querySelector("#age-birth").value;
      const target = document.querySelector("#age-target").value;
      if (!birth || !target) return setStatus("Tanggal lahir dan tanggal acuan wajib diisi.", "warn");
      const age = calculateAgeDetails(birth, target);
      if (!age) return setStatus("Tanggal acuan harus setelah tanggal lahir.", "warn");
      document.querySelector("#age-stats").innerHTML = [[`${age.years} th ${age.months} bln ${age.days} hr`, "Usia detail"], [`${formatNumber(age.totalDays, 0)} hari`, "Total hari hidup"], [`${age.nextBirthdayIn} hari lagi`, "Menuju ulang tahun"]].map(([value, label]) => `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`).join("");
      document.querySelector("#age-note").textContent = `Usia dihitung dari ${formatDisplayDate(birth)} sampai ${formatDisplayDate(target)}.`;
      setStatus("Umur berhasil dihitung.");
    };
    document.querySelector("#age-run").addEventListener("click", run);
    run();
  }

  function renderSavingsGoalCalculator() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Target tabungan</span><input class="tool-input" id="savings-target" type="number" min="0" value="50000000"></label><label class="tool-field"><span class="tool-label">Dana awal</span><input class="tool-input" id="savings-start" type="number" min="0" value="5000000"></label><label class="tool-field"><span class="tool-label">Bunga tahunan (%)</span><input class="tool-input" id="savings-rate" type="number" min="0" step="0.01" value="4"></label><label class="tool-field"><span class="tool-label">Durasi target (bulan)</span><input class="tool-input" id="savings-months" type="number" min="1" value="24"></label></div><div class="action-row"><button class="button button-primary" id="savings-run" type="button">Hitung Tabungan</button></div><div class="stats-grid" id="savings-stats"></div>`;
    document.querySelector("#savings-run").addEventListener("click", () => {
      const target = Number(document.querySelector("#savings-target").value);
      const start = Number(document.querySelector("#savings-start").value);
      const annualRate = Number(document.querySelector("#savings-rate").value) / 100;
      const months = Number(document.querySelector("#savings-months").value);
      if (target <= 0 || start < 0 || months <= 0 || target <= start) return setStatus("Target harus lebih besar dari dana awal dan durasi minimal 1 bulan.", "warn");
      const monthlyRate = annualRate / 12;
      let monthlySaving = 0;
      if (monthlyRate === 0) {
        monthlySaving = (target - start) / months;
      } else {
        monthlySaving = (target - (start * (1 + monthlyRate) ** months)) * monthlyRate / (((1 + monthlyRate) ** months) - 1);
      }
      monthlySaving = Math.max(monthlySaving, 0);
      const totalSaved = start + (monthlySaving * months);
      const estimatedInterest = target - totalSaved;
      document.querySelector("#savings-stats").innerHTML = [["Tabung / bulan", formatCurrency(monthlySaving, "IDR", 0)], ["Total setoran", formatCurrency(totalSaved, "IDR", 0)], ["Estimasi bunga", formatCurrency(estimatedInterest, "IDR", 0)]].map(([label, value]) => `<div class="stat-chip"><strong>${value}</strong><span>${label}</span></div>`).join("");
      setStatus("Kebutuhan tabungan bulanan berhasil dihitung.");
    });
  }

  function renderQrGenerator() {
    const qrBackgroundPresets = {
      plain: { color: "#ffffff", accent: "#ffffff", intensity: 0, label: "Putih bersih" },
      sky: { color: "#ffffff", accent: "#dcecff", intensity: 0.14, label: "Sky blue" },
      mint: { color: "#ffffff", accent: "#dcf7ee", intensity: 0.12, label: "Soft mint" },
      peach: { color: "#fffdf8", accent: "#ffe8d6", intensity: 0.11, label: "Soft peach" },
    };
    const qrThemePresets = {
      default: { className: "is-default", fill: "#ffffff", accent: "#f6f8fb", text: "#182433", muted: "#5b6574" },
      instagram: { className: "is-instagram", fill: "#ffffff", accent: "#ff7a59", text: "#ffffff", muted: "rgba(255,255,255,0.82)" },
      business: { className: "is-business", fill: "#fffdf8", accent: "#d9c3a1", text: "#1f2937", muted: "#6b7280" },
      dark: { className: "is-dark", fill: "#0f172a", accent: "#38bdf8", text: "#f8fafc", muted: "rgba(248,250,252,0.72)" },
    };
    const qrFramePresets = {
      none: { className: "is-none", padding: 0, borderWidth: 0, radius: 0 },
      clean: { className: "is-clean", padding: 18, borderWidth: 4, radius: 22 },
      rounded: { className: "is-rounded", padding: 22, borderWidth: 6, radius: 32 },
      dashed: { className: "is-dashed", padding: 20, borderWidth: 4, radius: 26, dash: [10, 7] },
      double: { className: "is-double", padding: 24, borderWidth: 3, radius: 28, innerGap: 10 },
    };
    const state = {
      logoDataUrl: "",
      logoName: "",
    };

    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">Teks atau URL</span><textarea class="tool-textarea" id="qr-text">https://corechipertools.local</textarea></label><label class="tool-field"><span class="tool-label">Style</span><select class="tool-select" id="qr-theme"><option value="default">Default</option><option value="instagram">Instagram style</option><option value="business">Business card</option><option value="dark">Dark mode</option></select></label><label class="tool-field"><span class="tool-label">Ukuran</span><input class="tool-input" id="qr-size" type="number" value="220" min="120" max="480"></label><label class="tool-field"><span class="tool-label">Warna QR</span><input class="tool-input" id="qr-color" type="color" value="#182433"></label><label class="tool-field"><span class="tool-label">Bentuk QR</span><select class="tool-select" id="qr-shape"><option value="square">Basic kotak</option><option value="rounded">Rounded</option><option value="dot">Dot</option><option value="diamond">Diamond</option></select></label><label class="tool-field"><span class="tool-label">Preset background</span><select class="tool-select" id="qr-bg-preset"><option value="plain">Putih bersih</option><option value="sky">Sky blue</option><option value="mint">Soft mint</option><option value="peach">Soft peach</option></select></label><label class="tool-field"><span class="tool-label">Gaya border</span><select class="tool-select" id="qr-border-style"><option value="clean">Clean</option><option value="rounded">Rounded</option><option value="dashed">Dashed</option><option value="double">Double</option><option value="none">Tanpa border</option></select></label><label class="tool-field"><span class="tool-label">Warna border</span><input class="tool-input" id="qr-border-color" type="color" value="#182433"></label><label class="tool-field"><span class="tool-label">Ukuran logo tengah</span><input class="tool-input" id="qr-logo-size" type="range" min="12" max="22" value="18"></label><label class="tool-field"><span class="tool-label">Teks bawah</span><input class="tool-input" id="qr-caption-title" type="text" value="Scan me"></label><label class="tool-field full"><span class="tool-label">Subteks</span><input class="tool-input" id="qr-caption-subtitle" type="text" value="Arahkan kamera untuk membuka link"></label><label class="tool-field full"><span class="tool-label">Logo tengah</span><input class="tool-input" id="qr-logo-file" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label><div id="qr-logo-list" class="tool-dropzone" data-drop-input="qr-logo-file"><strong>Upload logo untuk tengah QR</strong><p class="small-note">Format PNG, JPG, WEBP, atau SVG. Gunakan logo sederhana agar tetap mudah discan.</p></div></div><div class="tool-preview" id="tool-preview"><div class="qr-output"><p class="small-note">QR code akan muncul di sini.</p></div></div><div class="action-row"><button class="button button-primary" id="qr-run" type="button">Generate QR</button><button class="button secondary-button" id="qr-download" type="button">Unduh PNG</button></div>`;

    const getFrameOptions = () => {
      const preset = qrFramePresets[document.querySelector("#qr-border-style").value] || qrFramePresets.clean;
      const color = document.querySelector("#qr-border-color").value;
      return { ...preset, color };
    };

    const getBackgroundOptions = () => qrBackgroundPresets[document.querySelector("#qr-bg-preset").value] || qrBackgroundPresets.plain;
    const getThemeOptions = () => qrThemePresets[document.querySelector("#qr-theme").value] || qrThemePresets.default;
    const getCaptionOptions = () => ({
      title: document.querySelector("#qr-caption-title").value.trim(),
      subtitle: document.querySelector("#qr-caption-subtitle").value.trim(),
    });

    const syncFramePreview = (shell, options) => {
      shell.className = `qr-frame ${options.className}`;
      shell.style.setProperty("--qr-frame-color", options.color);
      shell.style.setProperty("--qr-frame-width", `${options.borderWidth}px`);
    };
    const syncThemePreview = (card, options) => {
      card.className = `qr-card ${options.className}`;
      card.style.setProperty("--qr-card-fill", options.fill);
      card.style.setProperty("--qr-card-accent", options.accent);
      card.style.setProperty("--qr-card-text", options.text);
      card.style.setProperty("--qr-card-muted", options.muted);
    };

    const refreshFramePreview = () => {
      const shell = document.querySelector("#qr-shell");
      if (!shell) return;
      syncFramePreview(shell, getFrameOptions());
    };

    const drawRoundedRect = (ctx, x, y, width, height, radius) => {
      const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
      ctx.beginPath();
      ctx.moveTo(x + safeRadius, y);
      ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
      ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
      ctx.arcTo(x, y + height, x, y, safeRadius);
      ctx.arcTo(x, y, x + width, y, safeRadius);
      ctx.closePath();
    };

    const isFinderZone = (row, col, count) => {
      const inTopLeft = row < 8 && col < 8;
      const inTopRight = row < 8 && col >= count - 8;
      const inBottomLeft = row >= count - 8 && col < 8;
      return inTopLeft || inTopRight || inBottomLeft;
    };

    const drawQrModule = (ctx, x, y, size, shape, locked) => {
      if (locked || shape === "square") {
        ctx.fillRect(x, y, size, size);
        return;
      }
      if (shape === "rounded") {
        drawRoundedRect(ctx, x, y, size, size, size * 0.32);
        ctx.fill();
        return;
      }
      if (shape === "dot") {
        ctx.beginPath();
        ctx.arc(x + (size / 2), y + (size / 2), size * 0.38, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      if (shape === "diamond") {
        const half = size / 2;
        ctx.beginPath();
        ctx.moveTo(x + half, y);
        ctx.lineTo(x + size, y + half);
        ctx.lineTo(x + half, y + size);
        ctx.lineTo(x, y + half);
        ctx.closePath();
        ctx.fill();
        return;
      }
      ctx.fillRect(x, y, size, size);
    };

    const paintQrBackground = (ctx, size, options) => {
      ctx.fillStyle = options.color;
      ctx.fillRect(0, 0, size, size);
      if (!options.intensity) return;
      ctx.save();
      ctx.globalAlpha = options.intensity;
      const topGlow = ctx.createRadialGradient(size * 0.18, size * 0.18, size * 0.02, size * 0.18, size * 0.18, size * 0.34);
      topGlow.addColorStop(0, options.accent);
      topGlow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, size, size);
      const bottomGlow = ctx.createRadialGradient(size * 0.84, size * 0.84, size * 0.02, size * 0.84, size * 0.84, size * 0.3);
      bottomGlow.addColorStop(0, options.accent);
      bottomGlow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = bottomGlow;
      ctx.fillRect(0, 0, size, size);
      ctx.restore();
    };

    const drawLogoBadge = async (ctx, size, logoDataUrl, logoPercent) => {
      if (!logoDataUrl) return;
      const image = await loadImageFromDataUrl(logoDataUrl);
      const safePercent = Math.min(logoPercent, 22);
      const logoSize = size * (safePercent / 100);
      const padding = logoSize * 0.24;
      const badgeSize = logoSize + (padding * 2);
      const x = (size - badgeSize) / 2;
      const y = (size - badgeSize) / 2;
      drawRoundedRect(ctx, x, y, badgeSize, badgeSize, badgeSize * 0.24);
      ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
      ctx.fill();
      ctx.save();
      ctx.shadowColor = "rgba(24, 36, 51, 0.18)";
      ctx.shadowBlur = 16;
      ctx.strokeStyle = "rgba(24, 36, 51, 0.08)";
      ctx.lineWidth = 1.5;
      drawRoundedRect(ctx, x, y, badgeSize, badgeSize, badgeSize * 0.24);
      ctx.stroke();
      ctx.restore();
      ctx.drawImage(image, x + padding, y + padding, logoSize, logoSize);
    };

    const renderStyledQrCanvas = async (qrMatrix, size, color, shape, background, logoDataUrl, logoPercent) => {
      const moduleCount = qrMatrix.length;
      const quietZone = 4;
      const totalModules = moduleCount + (quietZone * 2);
      const cellSize = size / totalModules;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      paintQrBackground(ctx, size, background);
      ctx.fillStyle = color;
      for (let row = 0; row < moduleCount; row += 1) {
        for (let col = 0; col < moduleCount; col += 1) {
          if (!qrMatrix[row][col]) continue;
          const x = (col + quietZone) * cellSize;
          const y = (row + quietZone) * cellSize;
          drawQrModule(ctx, x, y, cellSize, shape, isFinderZone(row, col, moduleCount));
        }
      }
      await drawLogoBadge(ctx, size, logoDataUrl, logoPercent);
      return canvas;
    };

    const buildExportCanvas = (sourceCanvas, frameOptions, themeOptions, captionOptions) => {
      const captionGap = captionOptions.title || captionOptions.subtitle ? 26 : 0;
      const titleHeight = captionOptions.title ? 34 : 0;
      const subtitleHeight = captionOptions.subtitle ? 22 : 0;
      const captionHeight = captionGap + titleHeight + subtitleHeight;
      const inset = frameOptions.borderWidth + frameOptions.padding;
      const outerCanvas = document.createElement("canvas");
      outerCanvas.width = sourceCanvas.width + inset * 2;
      outerCanvas.height = sourceCanvas.height + inset * 2 + captionHeight;
      const ctx = outerCanvas.getContext("2d");
      const panelInset = frameOptions.borderWidth / 2;
      const panelWidth = outerCanvas.width - frameOptions.borderWidth;
      const panelHeight = outerCanvas.height - frameOptions.borderWidth;
      ctx.clearRect(0, 0, outerCanvas.width, outerCanvas.height);
      if (themeOptions.className === "is-instagram") {
        const gradient = ctx.createLinearGradient(0, 0, outerCanvas.width, outerCanvas.height);
        gradient.addColorStop(0, "#833ab4");
        gradient.addColorStop(0.5, "#fd1d1d");
        gradient.addColorStop(1, "#fcb045");
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = themeOptions.fill;
      }
      drawRoundedRect(ctx, panelInset, panelInset, panelWidth, panelHeight, Math.max(frameOptions.radius, 30));
      ctx.fill();
      if (frameOptions.borderWidth > 0) {
        ctx.save();
        ctx.lineWidth = frameOptions.borderWidth;
        ctx.strokeStyle = frameOptions.color;
        if (frameOptions.dash) ctx.setLineDash(frameOptions.dash);
        drawRoundedRect(ctx, panelInset, panelInset, panelWidth, panelHeight, Math.max(frameOptions.radius - 1, 0));
        ctx.stroke();
        ctx.restore();
        if (frameOptions.innerGap) {
          const innerInset = panelInset + frameOptions.innerGap;
          ctx.save();
          ctx.lineWidth = Math.max(frameOptions.borderWidth - 1, 1);
          ctx.strokeStyle = frameOptions.color;
          drawRoundedRect(ctx, innerInset, innerInset, outerCanvas.width - innerInset * 2, outerCanvas.height - innerInset * 2, Math.max(frameOptions.radius - frameOptions.innerGap, 0));
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.drawImage(sourceCanvas, inset, inset, sourceCanvas.width, sourceCanvas.height);
      if (captionOptions.title || captionOptions.subtitle) {
        ctx.textAlign = "center";
        ctx.fillStyle = themeOptions.text;
        let cursorY = inset + sourceCanvas.height + 30;
        if (captionOptions.title) {
          ctx.font = "700 24px Arial";
          ctx.fillText(captionOptions.title, outerCanvas.width / 2, cursorY);
          cursorY += 30;
        }
        if (captionOptions.subtitle) {
          ctx.fillStyle = themeOptions.muted;
          ctx.font = "400 15px Arial";
          ctx.fillText(captionOptions.subtitle, outerCanvas.width / 2, cursorY);
        }
      }
      return outerCanvas;
    };

    const render = async () => {
      const QRCode = await ensureLibrary("qrcode");
      const preview = document.querySelector("#tool-preview");
      const frameOptions = getFrameOptions();
      const themeOptions = getThemeOptions();
      const captionOptions = getCaptionOptions();
      const size = Number(document.querySelector("#qr-size").value);
      const color = document.querySelector("#qr-color").value;
      const shape = document.querySelector("#qr-shape").value;
      const background = getBackgroundOptions();
      const logoPercent = Number(document.querySelector("#qr-logo-size").value);
      preview.innerHTML = '<div class="qr-output"><div id="qr-card" class="qr-card"><div id="qr-shell" class="qr-frame"><div id="qr-stage" class="qr-stage"></div></div><div class="qr-copy"><strong id="qr-copy-title"></strong><span id="qr-copy-subtitle"></span></div></div></div>';
      syncThemePreview(document.querySelector("#qr-card"), themeOptions);
      syncFramePreview(document.querySelector("#qr-shell"), frameOptions);
      document.querySelector("#qr-copy-title").textContent = captionOptions.title;
      document.querySelector("#qr-copy-subtitle").textContent = captionOptions.subtitle;
      const qrHost = document.createElement("div");
      const qrInstance = new QRCode(qrHost, {
        text: document.querySelector("#qr-text").value,
        width: size,
        height: size,
        colorDark: color,
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel?.H,
      });
      const qrMatrix = qrInstance?._oQRCode?.modules;
      if (!qrMatrix?.length) throw new Error("Gagal membangun pola QR code.");
      document.querySelector("#qr-stage").append(await renderStyledQrCanvas(qrMatrix, size, color, shape, background, state.logoDataUrl, logoPercent));
      if (state.logoDataUrl && logoPercent >= 20) {
        setStatus("QR dibuat dengan logo tengah besar. Jika masih sulit discan, kecilkan logo ke 16-18%.", "warn");
      }
    };
    document.querySelector("#qr-run").addEventListener("click", async () => { try { await render(); setStatus("QR code berhasil dibuat."); } catch (error) { setStatus(error.message, "error"); } });
    document.querySelector("#qr-download").addEventListener("click", async () => {
      const canvas = document.querySelector("#tool-preview canvas");
      if (!canvas) return setStatus("Generate QR code terlebih dahulu.", "warn");
      downloadBlob(await canvasToBlob(buildExportCanvas(canvas, getFrameOptions(), getThemeOptions(), getCaptionOptions()), "image/png"), "corechiper-qr.png");
      setStatus("QR code berhasil diunduh.");
    });
    document.querySelector("#qr-border-style").addEventListener("change", refreshFramePreview);
    document.querySelector("#qr-border-color").addEventListener("input", refreshFramePreview);
    document.querySelector("#qr-theme").addEventListener("change", async () => { try { await render(); } catch (error) { setStatus(error.message, "error"); } });
    document.querySelector("#qr-shape").addEventListener("change", async () => { try { await render(); } catch (error) { setStatus(error.message, "error"); } });
    document.querySelector("#qr-bg-preset").addEventListener("change", async () => { try { await render(); } catch (error) { setStatus(error.message, "error"); } });
    document.querySelector("#qr-logo-size").addEventListener("input", async () => { try { await render(); } catch (error) { setStatus(error.message, "error"); } });
    document.querySelector("#qr-caption-title").addEventListener("input", async () => { try { await render(); } catch (error) { setStatus(error.message, "error"); } });
    document.querySelector("#qr-caption-subtitle").addEventListener("input", async () => { try { await render(); } catch (error) { setStatus(error.message, "error"); } });
    document.querySelector("#qr-logo-file").addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      const list = document.querySelector("#qr-logo-list");
      if (!file) {
        state.logoDataUrl = "";
        state.logoName = "";
        list.innerHTML = "<strong>Upload logo untuk tengah QR</strong><p class=\"small-note\">Format PNG, JPG, WEBP, atau SVG. Gunakan logo sederhana agar tetap mudah discan.</p>";
        try { await render(); } catch (error) { setStatus(error.message, "error"); }
        return;
      }
      state.logoDataUrl = await readAsDataUrl(file);
      state.logoName = file.name;
      list.innerHTML = fileChipList([file]);
      await render();
      setStatus("Logo tengah berhasil ditambahkan ke preview QR.");
    });
    render();
  }

  function renderPasswordGenerator() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Panjang</span><input class="tool-input" id="pass-length" type="number" min="6" max="64" value="16"></label><label class="tool-field"><span class="tool-label">Huruf besar</span><select class="tool-select" id="pass-upper"><option value="yes">Ya</option><option value="no">Tidak</option></select></label><label class="tool-field"><span class="tool-label">Angka</span><select class="tool-select" id="pass-number"><option value="yes">Ya</option><option value="no">Tidak</option></select></label><label class="tool-field"><span class="tool-label">Simbol</span><select class="tool-select" id="pass-symbol"><option value="yes">Ya</option><option value="no">Tidak</option></select></label></div><div class="result-card"><div class="metric-highlight" id="pass-output">-</div><p id="pass-strength" class="small-note">Tekan generate untuk membuat password.</p></div><div class="action-row"><button class="button button-primary" id="pass-run" type="button">Generate Password</button><button class="button secondary-button" id="pass-copy" type="button">Salin</button></div>`;
    const generate = () => {
      const lower = "abcdefghijkmnopqrstuvwxyz";
      const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
      const numbers = "23456789";
      const symbols = "!@#$%^&*_-+=";
      let pool = lower;
      if (document.querySelector("#pass-upper").value === "yes") pool += upper;
      if (document.querySelector("#pass-number").value === "yes") pool += numbers;
      if (document.querySelector("#pass-symbol").value === "yes") pool += symbols;
      const length = Number(document.querySelector("#pass-length").value);
      let password = "";
      crypto.getRandomValues(new Uint32Array(length)).forEach((value) => { password += pool[value % pool.length]; });
      document.querySelector("#pass-output").textContent = password;
      document.querySelector("#pass-strength").textContent = `Kekuatan: ${length >= 16 && pool.length > 50 ? "Sangat kuat" : length >= 12 ? "Kuat" : "Cukup"}`;
      setStatus("Password berhasil dibuat.");
    };
    document.querySelector("#pass-run").addEventListener("click", generate);
    document.querySelector("#pass-copy").addEventListener("click", async () => {
      const text = document.querySelector("#pass-output").textContent;
      if (!text || text === "-") return setStatus("Generate password terlebih dahulu.", "warn");
      await navigator.clipboard.writeText(text);
      setStatus("Password berhasil disalin.");
    });
    generate();
  }

  function renderColorPicker() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Warna utama</span><input class="tool-input" id="color-main" type="color" value="#e6672e"></label><label class="tool-field"><span class="tool-label">Nilai HEX</span><input class="tool-input" id="color-hex" type="text" value="#e6672e"></label></div><div class="action-row"><button class="button button-primary" id="color-run" type="button">Generate Palette</button><button class="button secondary-button" id="color-eye" type="button">Ambil dari layar</button></div><div class="palette-grid" id="color-palette"></div>`;
    const renderPalette = (hex) => {
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      const shades = [-24, -12, 0, 12, 24].map((offset) => hslToHex(hsl.h, hsl.s, Math.max(5, Math.min(95, hsl.l + offset))));
      document.querySelector("#color-palette").innerHTML = shades.map((color) => { const rgbValue = hexToRgb(color); return `<div class="palette-card"><div class="palette-swatch" style="background:${color}"></div><strong>${color}</strong><div>rgb(${rgbValue.r}, ${rgbValue.g}, ${rgbValue.b})</div></div>`; }).join("");
      setStatus("Palette warna berhasil dibuat.");
    };
    document.querySelector("#color-run").addEventListener("click", () => { const hex = document.querySelector("#color-hex").value.trim(); document.querySelector("#color-main").value = hex; renderPalette(hex); });
    document.querySelector("#color-main").addEventListener("input", (event) => { document.querySelector("#color-hex").value = event.target.value; renderPalette(event.target.value); });
    document.querySelector("#color-eye").addEventListener("click", async () => {
      if (!("EyeDropper" in window)) return setStatus("Browser ini belum mendukung EyeDropper API.", "warn");
      const result = await new window.EyeDropper().open();
      document.querySelector("#color-main").value = result.sRGBHex;
      document.querySelector("#color-hex").value = result.sRGBHex;
      renderPalette(result.sRGBHex);
    });
    renderPalette("#e6672e");
  }

  function createPdfStudio(options = {}) {
    ui.workspace.innerHTML = html`
      <div class="pdf-studio-shell">
        <section class="result-card pdf-studio-panel">
          <div class="tool-form-grid">
            ${inputFileTemplate({ id: options.inputId || "studio-pdf-file", listId: options.listId || "studio-pdf-list", label: options.uploadLabel || "Unggah PDF", accept: ".pdf,application/pdf", note: options.uploadNote || "Tarik PDF ke area ini atau klik untuk memilih file." })}
            ${options.modeFields || ""}
          </div>
          <div class="action-row">${options.actions || ""}</div>
          ${options.extraPanel || ""}
        </section>
        <section class="result-card pdf-studio-panel">
          <div class="studio-head">
            <div>
              <h3>Live Preview</h3>
              <p class="small-note">${options.previewNote || "PDF akan dirender per halaman, lalu elemen bisa digeser di atas preview."}</p>
            </div>
            <div class="studio-chip" id="studio-page-indicator">Belum ada PDF dimuat</div>
          </div>
          ${options.previewToolbar || ""}
          <div class="pdf-studio-scroll" id="pdf-studio-preview"><p class="small-note">Upload PDF untuk mulai edit.</p></div>
        </section>
      </div>
    `;
    const state = {
      file: null,
      previewPages: [],
      items: [],
      selectedId: null,
      currentPage: 0,
      pendingPlacement: null,
      clipboardItem: null,
      progress: createProgressCard(options.progressTitle || "Progress Editor PDF"),
    };
    const input = document.querySelector(`#${options.inputId || "studio-pdf-file"}`);
    const list = document.querySelector(`#${options.listId || "studio-pdf-list"}`);
    const preview = document.querySelector("#pdf-studio-preview");
    const pageIndicator = document.querySelector("#studio-page-indicator");

    const getSelectedItem = () => state.items.find((item) => item.id === state.selectedId) || null;
    const selectItem = (id) => {
      state.selectedId = id;
      preview.querySelectorAll(".pdf-overlay-item").forEach((element) => element.classList.toggle("selected", element.dataset.itemId === id));
      if (typeof state.onSelectionChange === "function") state.onSelectionChange(getSelectedItem());
      if (typeof options.onSelect === "function") options.onSelect(state, getSelectedItem());
    };
    const updatePageIndicator = () => {
      const total = state.previewPages.length;
      pageIndicator.textContent = total ? `Halaman ${state.currentPage + 1} dari ${total}` : "Belum ada PDF dimuat";
    };
    const refreshPageMetrics = () => {
      state.previewPages.forEach((pageData) => {
        const rect = pageData.overlay.getBoundingClientRect();
        pageData.displayWidth = rect.width || pageData.canvas.width;
        pageData.displayHeight = rect.height || pageData.canvas.height;
      });
    };
    const renderItems = () => {
      refreshPageMetrics();
      state.previewPages.forEach((pageData, pageIndex) => {
        pageData.overlay.innerHTML = "";
        state.items.filter((item) => item.pageIndex === pageIndex).forEach((item) => {
          const metrics = getDisplayMetrics(pageData, item);
          const element = document.createElement("button");
          element.type = "button";
          element.className = `pdf-overlay-item ${item.kind}`;
          element.dataset.itemId = item.id;
          element.style.left = `${metrics.x}px`;
          element.style.top = `${metrics.y}px`;
          element.style.width = `${metrics.itemWidth}px`;
          element.style.height = `${metrics.itemHeight}px`;
          element.style.opacity = item.opacity ?? 1;
          element.style.transform = `rotate(${item.rotation || 0}deg)`;
          if (item.kind === "text") {
            element.innerHTML = `<span style="font-size:${item.fontSize || 28}px;color:${item.color || "#182433"}">${escapeHtml(item.text || "")}</span>`;
          } else if (item.kind === "redact") {
            element.innerHTML = `<span>${item.redactStyle}</span>`;
            element.dataset.style = item.redactStyle;
          } else {
            element.innerHTML = `<img src="${item.dataUrl}" alt="${item.kind}" draggable="false">`;
          }
          element.addEventListener("click", (event) => {
            event.stopPropagation();
            selectItem(item.id);
          });
          const handle = document.createElement("span");
          handle.className = "pdf-resize-handle";
          handle.setAttribute("aria-hidden", "true");
          element.appendChild(handle);
          attachDragBehavior(element, item, pageData, state, renderItems, options.onSelect);
          attachResizeBehavior(handle, item, pageData, state, renderItems, options.onSelect);
          pageData.overlay.appendChild(element);
        });
      });
      if (typeof state.onSelectionChange === "function") state.onSelectionChange(getSelectedItem());
    };
    const addItem = (item) => {
      state.items.push(item);
      selectItem(item.id);
      renderItems();
    };
    const cloneStudioItem = (item, overrides = {}) => ({
      ...structuredClone({
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      }),
      ...overrides,
    });
    const removeSelected = () => {
      if (!state.selectedId) return;
      state.items = state.items.filter((item) => item.id !== state.selectedId);
      state.selectedId = null;
      renderItems();
    };
    const loadPdf = async (file) => {
      const pdfjsLib = await ensureLibrary("pdfjs");
      state.file = file;
      state.items = [];
      state.selectedId = null;
      state.previewPages = [];
      preview.innerHTML = "";
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([file])}`;
      const pdf = await pdfjsLib.getDocument({ data: await readAsArrayBuffer(file) }).promise;
      state.progress.update(6, "Membaca struktur PDF...");
      for (let index = 1; index <= pdf.numPages; index += 1) {
        await yieldToBrowser();
        const page = await pdf.getPage(index);
        const unitViewport = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        const wrapper = document.createElement("div");
        wrapper.className = "pdf-page-stage";
        wrapper.dataset.pageIndex = String(index - 1);
        wrapper.innerHTML = `<div class="pdf-page-paper"></div>`;
        wrapper.querySelector(".pdf-page-paper").appendChild(canvas);
        const overlay = document.createElement("div");
        overlay.className = "pdf-overlay-layer";
        wrapper.appendChild(overlay);
        const label = document.createElement("div");
        label.className = "pdf-page-caption";
        label.textContent = `Halaman ${index}`;
        wrapper.appendChild(label);
        wrapper.addEventListener("click", (event) => {
          state.currentPage = index - 1;
          updatePageIndicator();
          refreshPageMetrics();
          if (state.pendingPlacement) {
            const rect = overlay.getBoundingClientRect();
            const scaleX = canvas.width / Math.max(rect.width, 1);
            const scaleY = canvas.height / Math.max(rect.height, 1);
            const nextItem = state.pendingPlacement({
              pageIndex: index - 1,
              x: clamp((event.clientX - rect.left) - 90, 0, rect.width - 40),
              y: clamp((event.clientY - rect.top) - 40, 0, rect.height - 24),
              pageWidth: rect.width,
              pageHeight: rect.height,
            });
            nextItem.canvasX = clamp((nextItem.x ?? 0) * scaleX, 0, canvas.width);
            nextItem.canvasY = clamp((nextItem.y ?? 0) * scaleY, 0, canvas.height);
            nextItem.canvasWidth = clamp((nextItem.width ?? 180) * scaleX, 40, canvas.width);
            nextItem.canvasHeight = clamp((nextItem.height ?? 80) * scaleY, 24, canvas.height);
            syncItemLegacyRatios({ canvas }, nextItem);
            syncItemPdfBox({ canvas, pdfWidth: unitViewport.width, pdfHeight: unitViewport.height }, nextItem);
            state.pendingPlacement = null;
            addItem(nextItem);
            setStatus("Elemen diletakkan ke halaman. Anda bisa tarik dan resize langsung dengan kursor.");
          } else if (!event.target.closest(".pdf-overlay-item")) {
            selectItem(null);
          }
        });
        preview.appendChild(wrapper);
        const rawView = page.view || [0, 0, canvas.width, canvas.height];
        state.previewPages.push({
          wrapper,
          canvas,
          overlay,
          width: canvas.width,
          height: canvas.height,
          displayWidth: canvas.width,
          displayHeight: canvas.height,
          pdfWidth: unitViewport.width,
          pdfHeight: unitViewport.height,
          pdfViewX: rawView[0] || 0,
          pdfViewY: rawView[1] || 0,
          pdfViewWidth: (rawView[2] || canvas.width) - (rawView[0] || 0),
          pdfViewHeight: (rawView[3] || canvas.height) - (rawView[1] || 0),
        });
        state.progress.update(percentLabel(index, pdf.numPages), `Merender halaman ${index} dari ${pdf.numPages}...`);
      }
      refreshPageMetrics();
      state.currentPage = 0;
      updatePageIndicator();
      state.progress.update(100, "Preview PDF siap diedit.");
      if (typeof options.onLoaded === "function") options.onLoaded(state);
    };
    input.addEventListener("change", async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        setStatus("PDF dimuat ke editor...");
        await loadPdf(file);
        preview.scrollIntoView({ behavior: "smooth", block: "start" });
        setStatus("PDF siap diedit.");
      } catch (error) {
        setStatus(error.message, "error");
      }
    });
    window.addEventListener("resize", debounce(() => {
      refreshPageMetrics();
      renderItems();
    }, 140));
    document.addEventListener("keydown", (event) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
        const item = getSelectedItem();
        if (!item) return;
        event.preventDefault();
        state.clipboardItem = cloneStudioItem(item);
        setStatus("Elemen terpilih disalin. Tekan Ctrl+V untuk menempel.");
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
        if (!state.clipboardItem) return;
        event.preventDefault();
        const pageData = state.previewPages[state.currentPage] || state.previewPages[state.clipboardItem.pageIndex] || state.previewPages[0];
        if (!pageData) return;
        const metrics = getDisplayMetrics(pageData, state.clipboardItem);
        const canvasWidth = pageData.canvas?.width || pageData.width || 1;
        const canvasHeight = pageData.canvas?.height || pageData.height || 1;
        const pasted = cloneStudioItem(state.clipboardItem, {
          pageIndex: state.currentPage,
          canvasX: clamp(metrics.x + 18, 0, Math.max(0, (pageData.displayWidth || pageData.width) - metrics.itemWidth)) * (canvasWidth / Math.max(pageData.displayWidth || pageData.width || 1, 1)),
          canvasY: clamp(metrics.y + 18, 0, Math.max(0, (pageData.displayHeight || pageData.height) - metrics.itemHeight)) * (canvasHeight / Math.max(pageData.displayHeight || pageData.height || 1, 1)),
        });
        syncItemLegacyRatios(pageData, pasted);
        syncItemPdfBox(pageData, pasted);
        addItem(pasted);
        setStatus("Elemen berhasil ditempel. Anda bisa langsung menggeser atau resize lagi.");
      }
    });
    return {
      state,
      addItem,
      removeSelected,
      renderItems,
      getSelectedItem,
      selectItem,
      queuePlacement(factory, message = "Klik area PDF untuk meletakkan elemen tepat di posisi kursor.") {
        state.pendingPlacement = factory;
        setStatus(message);
      },
      updateSelected(update) {
        const item = getSelectedItem();
        if (!item) return;
        Object.assign(item, update);
        renderItems();
      },
    };
  }

  function attachDragBehavior(element, item, pageData, state, renderItems, onSelect) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let itemWidth = 0;
    let itemHeight = 0;
    element.addEventListener("pointerdown", (event) => {
      if (event.target.closest(".pdf-resize-handle")) return;
      dragging = true;
      element.setPointerCapture(event.pointerId);
      startX = event.clientX;
      startY = event.clientY;
      const metrics = getDisplayMetrics(pageData, item);
      originX = metrics.x;
      originY = metrics.y;
      itemWidth = metrics.itemWidth;
      itemHeight = metrics.itemHeight;
      state.selectedId = item.id;
      if (typeof onSelect === "function") onSelect(state, item);
      element.classList.add("dragging");
    });
    element.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const width = pageData.displayWidth || pageData.width || 1;
      const height = pageData.displayHeight || pageData.height || 1;
      const canvasWidth = pageData.canvas?.width || pageData.width || 1;
      const canvasHeight = pageData.canvas?.height || pageData.height || 1;
      const nextX = clamp(originX + (event.clientX - startX), 0, Math.max(0, width - itemWidth));
      const nextY = clamp(originY + (event.clientY - startY), 0, Math.max(0, height - itemHeight));
      item.canvasX = nextX * (canvasWidth / Math.max(width, 1));
      item.canvasY = nextY * (canvasHeight / Math.max(height, 1));
      syncItemLegacyRatios(pageData, item);
      syncItemPdfBox(pageData, item);
      element.style.left = `${nextX}px`;
      element.style.top = `${nextY}px`;
    });
    const stop = () => {
      if (dragging) renderItems();
      dragging = false;
      element.classList.remove("dragging");
    };
    element.addEventListener("pointerup", stop);
    element.addEventListener("pointercancel", stop);
  }

  function attachResizeBehavior(handle, item, pageData, state, renderItems, onSelect) {
    let resizing = false;
    let startX = 0;
    let startY = 0;
    let originWidth = 0;
    let originHeight = 0;
    let originX = 0;
    let originY = 0;
    handle.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      resizing = true;
      handle.setPointerCapture(event.pointerId);
      startX = event.clientX;
      startY = event.clientY;
      const metrics = getDisplayMetrics(pageData, item);
      originWidth = metrics.itemWidth;
      originHeight = metrics.itemHeight;
      originX = metrics.x;
      originY = metrics.y;
      state.selectedId = item.id;
      if (typeof onSelect === "function") onSelect(state, item);
    });
    handle.addEventListener("pointermove", (event) => {
      if (!resizing) return;
      const width = pageData.displayWidth || pageData.width || 1;
      const height = pageData.displayHeight || pageData.height || 1;
      const canvasWidth = pageData.canvas?.width || pageData.width || 1;
      const canvasHeight = pageData.canvas?.height || pageData.height || 1;
      const nextWidth = clamp(originWidth + (event.clientX - startX), 40, Math.max(40, width - originX));
      const nextHeight = clamp(originHeight + (event.clientY - startY), 24, Math.max(24, height - originY));
      item.canvasWidth = nextWidth * (canvasWidth / Math.max(width, 1));
      item.canvasHeight = nextHeight * (canvasHeight / Math.max(height, 1));
      syncItemLegacyRatios(pageData, item);
      syncItemPdfBox(pageData, item);
      const element = handle.parentElement;
      if (element) {
        element.style.width = `${nextWidth}px`;
        element.style.height = `${nextHeight}px`;
      }
    });
    const stop = () => {
      if (resizing) renderItems();
      resizing = false;
    };
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  }

  async function saveOverlayPdf(studio, options = {}) {
    if (!studio.state.file) throw new Error("Unggah PDF terlebih dahulu.");
    if (options.flattenOutput) {
      const pdfjsLib = await ensureLibrary("pdfjs");
      const { PDFDocument } = await ensureLibrary("pdfLib");
      const flattenedPdf = await PDFDocument.create();
      const sourcePdf = await pdfjsLib.getDocument({ data: await readAsArrayBuffer(studio.state.file) }).promise;
      const renderScale = Math.max(4, Number(options.renderScale) || 4.5);
      studio.state.progress.update(10, "Merender ulang halaman kualitas maksimum tanpa layer teks asli...");
      for (let pageIndex = 0; pageIndex < studio.state.previewPages.length; pageIndex += 1) {
        await yieldToBrowser();
        const sourcePage = await sourcePdf.getPage(pageIndex + 1);
        const previewPage = studio.state.previewPages[pageIndex];
        const pageItems = studio.state.items.filter((item) => item.pageIndex === pageIndex);
        const composedCanvas = await renderFlattenedPdfPageCanvas(sourcePage, previewPage, pageItems, { scale: renderScale });
        const imageBlob = await canvasToBlob(composedCanvas, "image/png");
        const imageDataUrl = await blobToDataUrl(imageBlob);
        const embeddedImage = await embedPdfImageFromDataUrl(flattenedPdf, imageDataUrl);
        const page = flattenedPdf.addPage([previewPage.pdfWidth || previewPage.canvas.width, previewPage.pdfHeight || previewPage.canvas.height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: page.getWidth(),
          height: page.getHeight(),
        });
        studio.state.progress.update(12 + (88 * ((pageIndex + 1) / studio.state.previewPages.length)), `Mengamankan halaman ${pageIndex + 1}...`);
      }
      return new Blob([await flattenedPdf.save()], { type: "application/pdf" });
    }
    const { PDFDocument, StandardFonts, rgb, degrees } = await ensureLibrary("pdfLib");
    const pdf = await PDFDocument.load(await readAsArrayBuffer(studio.state.file));
    const overlayFont = await pdf.embedFont(StandardFonts.Helvetica);
    studio.state.progress.update(10, "Membuka dokumen untuk disimpan...");
    for (let pageIndex = 0; pageIndex < studio.state.previewPages.length; pageIndex += 1) {
      await yieldToBrowser();
      const pageItems = studio.state.items.filter((item) => item.pageIndex === pageIndex);
      if (!pageItems.length) continue;
      const page = pdf.getPage(pageIndex);
      const previewPage = studio.state.previewPages[pageIndex];
      const pageBox = { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() };
      for (const item of pageItems) {
        const pdfMetrics = getPdfOverlayMetrics(previewPage, pageBox, item);
        if (item.kind === "text") {
          const color = hexToRgbObject(item.color || "#182433");
          const fontSize = Math.max(10, pdfMetrics.fontSize);
          const lines = String(item.text || "").split("\n");
          const lineHeight = fontSize * 1.2;
          const blockHeight = Math.max(lineHeight, lines.length * lineHeight);
          const startY = pdfMetrics.y + ((pdfMetrics.height - blockHeight) / 2) + blockHeight - fontSize;
          lines.forEach((line, index) => {
            const safeLine = String(line || "");
            const textWidth = overlayFont.widthOfTextAtSize(safeLine, fontSize);
            page.drawText(safeLine, {
              x: pdfMetrics.x + Math.max(0, (pdfMetrics.width - textWidth) / 2),
              y: startY - (index * lineHeight),
              size: fontSize,
              font: overlayFont,
              color: rgb(color.r, color.g, color.b),
              rotate: degrees(item.rotation || 0),
              opacity: item.opacity ?? 1,
              maxWidth: pdfMetrics.width,
            });
          });
        } else if (item.kind === "redact") {
          const redactOrigin = getCenteredPdfOrigin(
            pdfMetrics.x + (pdfMetrics.width / 2),
            pdfMetrics.y + (pdfMetrics.height / 2),
            pdfMetrics.width,
            pdfMetrics.height,
            item.rotation || 0,
          );
          if (item.redactStyle === "black" || item.redactStyle === "white") {
            const fill = item.redactStyle === "black" ? rgb(0, 0, 0) : rgb(1, 1, 1);
            page.drawRectangle({
              x: redactOrigin.x,
              y: redactOrigin.y,
              width: pdfMetrics.width,
              height: pdfMetrics.height,
              color: fill,
              rotate: degrees(item.rotation || 0),
              opacity: item.opacity ?? 1,
            });
          } else {
            const patchDataUrl = createRedactionPatch(previewPage.canvas, item);
            const embeddedImage = await embedPdfImageFromDataUrl(pdf, patchDataUrl);
            page.drawImage(embeddedImage, {
              x: redactOrigin.x,
              y: redactOrigin.y,
              width: pdfMetrics.width,
              height: pdfMetrics.height,
              rotate: degrees(item.rotation || 0),
              opacity: item.opacity ?? 1,
            });
          }
        } else {
          const embeddedImage = await embedPdfImageFromDataUrl(pdf, item.dataUrl);
          const fit = fitRect(pdfMetrics.width, pdfMetrics.height, item.assetWidth || embeddedImage.width, item.assetHeight || embeddedImage.height);
          const imageOrigin = getCenteredPdfOrigin(
            pdfMetrics.x + (pdfMetrics.width / 2),
            pdfMetrics.y + (pdfMetrics.height / 2),
            fit.width,
            fit.height,
            item.rotation || 0,
          );
          page.drawImage(embeddedImage, {
            x: imageOrigin.x,
            y: imageOrigin.y,
            width: fit.width,
            height: fit.height,
            rotate: degrees(item.rotation || 0),
            opacity: item.opacity ?? 1,
          });
        }
      }
      studio.state.progress.update(12 + (88 * ((pageIndex + 1) / studio.state.previewPages.length)), `Menyimpan halaman ${pageIndex + 1}...`);
    }
    return new Blob([await pdf.save()], { type: "application/pdf" });
  }

  function getPdfOverlayMetrics(previewPage, pageBox, item) {
    if (Number.isFinite(item.pdfX) && Number.isFinite(item.pdfY) && Number.isFinite(item.pdfWidth) && Number.isFinite(item.pdfHeight)) {
      return {
        x: item.pdfX,
        y: item.pdfY,
        width: item.pdfWidth,
        height: item.pdfHeight,
        fontSize: Math.max(10, ((item.fontSize || 28) * item.pdfHeight) / Math.max(item.canvasHeight || previewPage.canvas?.height || 1, 1)),
      };
    }
    const sourceMetrics = getCanvasItemMetrics(previewPage, item);
    const previewWidth = Math.max(previewPage.canvas?.width || previewPage.width || 1, 1);
    const previewHeight = Math.max(previewPage.canvas?.height || previewPage.height || 1, 1);
    const scaleX = pageBox.width / previewWidth;
    const scaleY = pageBox.height / previewHeight;
    const width = Math.max(1, sourceMetrics.itemWidth * scaleX);
    const height = Math.max(1, sourceMetrics.itemHeight * scaleY);
    const x = sourceMetrics.x * scaleX;
    const y = pageBox.height - ((sourceMetrics.y + sourceMetrics.itemHeight) * scaleY);
    return {
      x,
      y,
      width,
      height,
      fontSize: Math.max(10, (item.fontSize || 28) * scaleY),
    };
  }

  async function embedPdfImageFromDataUrl(pdf, dataUrl) {
    const normalizedDataUrl = await normalizeImageDataUrlForPdf(dataUrl);
    const bytes = dataUrlToUint8Array(normalizedDataUrl);
    if (/^data:image\/png/i.test(normalizedDataUrl)) return pdf.embedPng(bytes);
    if (/^data:image\/jpe?g/i.test(normalizedDataUrl)) return pdf.embedJpg(bytes);
    return pdf.embedPng(bytes);
  }

  async function normalizeImageDataUrlForPdf(dataUrl) {
    if (/^data:image\/(png|jpe?g);/i.test(dataUrl)) return dataUrl;
    const image = await loadImageFromDataUrl(dataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width || 1;
    canvas.height = image.naturalHeight || image.height || 1;
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    const pngBlob = await canvasToBlob(canvas, "image/png");
    return blobToDataUrl(pngBlob);
  }

  function measureCanvasTextWidth(text, fontSize, fontFamily = "Helvetica, Arial, sans-serif", fontWeight = "700") {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    return context.measureText(String(text || "")).width;
  }

  function createWatermarkTextDataUrl(text, options = {}) {
    const size = Number(options.size) || 120;
    const color = options.color || "#d3541e";
    const content = String(text || "WATERMARK");
    const paddingX = Math.max(24, Math.round(size * 0.35));
    const paddingY = Math.max(18, Math.round(size * 0.25));
    const textWidth = Math.ceil(measureCanvasTextWidth(content, size, "Helvetica, Arial, sans-serif", "700"));
    const textHeight = Math.ceil(size * 1.2);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, textWidth + (paddingX * 2));
    canvas.height = Math.max(1, textHeight + (paddingY * 2));
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = `700 ${size}px Helvetica, Arial, sans-serif`;
    context.fillStyle = color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(content, canvas.width / 2, canvas.height / 2);
    return {
      dataUrl: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
    };
  }

  function getWatermarkLayout(pageWidth, pageHeight, options = {}) {
    const size = Number(options.size) || 120;
    const assetWidth = options.assetWidth || 1;
    const assetHeight = options.assetHeight || 1;
    const drawWidth = options.mode === "image" ? size * 1.7 : Math.max(size * 1.9, assetWidth);
    const drawHeight = drawWidth / Math.max(assetWidth / assetHeight, 0.01);
    return {
      centerX: pageWidth / 2,
      centerY: pageHeight / 2,
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    };
  }

  function getRotatedBoundingBox(width, height, rotationDegrees = 0) {
    const radians = (Number(rotationDegrees) || 0) * (Math.PI / 180);
    const corners = [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: 0, y: height },
      { x: width, y: height },
    ].map((point) => ({
      x: (point.x * Math.cos(radians)) - (point.y * Math.sin(radians)),
      y: (point.x * Math.sin(radians)) + (point.y * Math.cos(radians)),
    }));
    const xs = corners.map((point) => point.x);
    const ys = corners.map((point) => point.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
    };
  }

  function getCenteredPdfOrigin(centerX, centerY, width, height, rotationDegrees = 0) {
    const box = getRotatedBoundingBox(width, height, rotationDegrees);
    return {
      x: centerX - ((box.minX + box.maxX) / 2),
      y: centerY - ((box.minY + box.maxY) / 2),
    };
  }

  function getCenteredPreviewOrigin(centerX, centerY, width, height, rotationDegrees = 0) {
    const box = getRotatedBoundingBox(width, height, rotationDegrees);
    return {
      left: centerX - ((box.minX + box.maxX) / 2),
      top: centerY - ((box.minY + box.maxY) / 2),
    };
  }

  function createRedactionPatch(canvas, item) {
    const pageData = { canvas, width: canvas.width, height: canvas.height };
    const metrics = getCanvasItemMetrics(pageData, item);
    return createRedactionPatchFromMetrics(canvas, {
      x: Math.round(metrics.x),
      y: Math.round(metrics.y),
      itemWidth: Math.max(12, Math.round(metrics.itemWidth)),
      itemHeight: Math.max(12, Math.round(metrics.itemHeight)),
    }, item.redactStyle);
  }

  function createRedactionPatchFromMetrics(canvas, metrics, redactStyle) {
    const patch = document.createElement("canvas");
    const sourceX = Math.round(metrics.x);
    const sourceY = Math.round(metrics.y);
    const sourceWidth = Math.max(12, Math.round(metrics.itemWidth));
    const sourceHeight = Math.max(12, Math.round(metrics.itemHeight));
    patch.width = sourceWidth;
    patch.height = sourceHeight;
    const context = patch.getContext("2d");
    const source = document.createElement("canvas");
    source.width = sourceWidth;
    source.height = sourceHeight;
    const sourceContext = source.getContext("2d");
    sourceContext.drawImage(canvas, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, patch.width, patch.height);
    context.drawImage(source, 0, 0);
    if (redactStyle === "blur") {
      context.filter = "blur(8px)";
      context.drawImage(source, 0, 0);
      context.filter = "none";
      context.globalAlpha = 0.28;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, patch.width, patch.height);
    }
    if (redactStyle === "glitch") {
      const slices = 8;
      for (let index = 0; index < slices; index += 1) {
        const y = Math.floor((patch.height / slices) * index);
        const height = Math.max(6, Math.floor(patch.height / slices));
        const offset = (index % 2 === 0 ? -1 : 1) * Math.floor(Math.random() * 14);
        const strip = context.getImageData(0, y, patch.width, Math.min(height, patch.height - y));
        context.putImageData(strip, offset, y);
      }
      context.globalAlpha = 0.22;
      context.fillStyle = "#111827";
      context.fillRect(0, 0, patch.width, patch.height);
    }
    return patch.toDataURL("image/png");
  }

  async function renderFlattenedPdfPageCanvas(pdfPage, previewPage, pageItems, options = {}) {
    const scale = Math.max(1, Number(options.scale) || 2);
    const viewport = pdfPage.getViewport({ scale });
    const composed = document.createElement("canvas");
    composed.width = Math.max(1, Math.round(viewport.width));
    composed.height = Math.max(1, Math.round(viewport.height));
    const context = composed.getContext("2d");
    await pdfPage.render({ canvasContext: context, viewport }).promise;
    const pageBox = {
      x: 0,
      y: 0,
      width: previewPage.pdfWidth || pdfPage.getViewport({ scale: 1 }).width,
      height: previewPage.pdfHeight || pdfPage.getViewport({ scale: 1 }).height,
    };
    const scaleX = composed.width / Math.max(pageBox.width, 1);
    const scaleY = composed.height / Math.max(pageBox.height, 1);
    for (const item of pageItems) {
      const pdfMetrics = getPdfOverlayMetrics(previewPage, pageBox, item);
      const width = Math.max(1, Math.round(pdfMetrics.width * scaleX));
      const height = Math.max(1, Math.round(pdfMetrics.height * scaleY));
      const x = Math.round(pdfMetrics.x * scaleX);
      const y = Math.round(composed.height - ((pdfMetrics.y + pdfMetrics.height) * scaleY));
      context.save();
      context.globalAlpha = item.opacity ?? 1;
      context.translate(x + (width / 2), y + (height / 2));
      context.rotate(((item.rotation || 0) * Math.PI) / 180);
      if (item.kind === "text") {
        const fontSize = Math.max(12, Math.round(pdfMetrics.fontSize * scaleY));
        context.fillStyle = item.color || "#182433";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = `${fontSize}px Aptos, Segoe UI, sans-serif`;
        const lines = String(item.text || "").split("\n");
        const lineHeight = fontSize * 1.2;
        lines.forEach((line, index) => {
          const baseline = ((index - ((lines.length - 1) / 2)) * lineHeight);
          context.fillText(line, 0, baseline, width);
        });
      } else if (item.kind === "redact") {
        if (item.redactStyle === "black") {
          context.fillStyle = "#000000";
          context.fillRect(-(width / 2), -(height / 2), width, height);
        } else if (item.redactStyle === "white") {
          context.fillStyle = "#ffffff";
          context.fillRect(-(width / 2), -(height / 2), width, height);
        } else {
          const patch = await loadImageFromDataUrl(createRedactionPatchFromMetrics(composed, { x, y, itemWidth: width, itemHeight: height }, item.redactStyle));
          context.drawImage(patch, -(width / 2), -(height / 2), width, height);
        }
      } else {
        const image = await loadImageFromDataUrl(item.dataUrl);
        const fit = fitRect(width, height, item.assetWidth || image.naturalWidth, item.assetHeight || image.naturalHeight);
        context.drawImage(image, -(width / 2) + fit.x, -(height / 2) + fit.y, fit.width, fit.height);
      }
      context.restore();
    }
    return composed;
  }

  async function renderEditedPageCanvas(previewPage, pageItems) {
    const composed = document.createElement("canvas");
    composed.width = previewPage.canvas.width;
    composed.height = previewPage.canvas.height;
    const context = composed.getContext("2d");
    context.drawImage(previewPage.canvas, 0, 0);
    const pageMetrics = {
      ...previewPage,
      displayWidth: previewPage.canvas.width,
      displayHeight: previewPage.canvas.height,
    };
    for (const item of pageItems) {
      const metrics = getDisplayMetrics(pageMetrics, item);
      const x = Math.round(metrics.x);
      const y = Math.round(metrics.y);
      const width = Math.max(1, Math.round(metrics.itemWidth));
      const height = Math.max(1, Math.round(metrics.itemHeight));
      context.save();
      context.globalAlpha = item.opacity ?? 1;
      context.translate(x + (width / 2), y + (height / 2));
      context.rotate(((item.rotation || 0) * Math.PI) / 180);
      if (item.kind === "text") {
        const fontSize = Math.max(12, Math.round(item.fontSize || 28));
        context.fillStyle = item.color || "#182433";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = `${fontSize}px Aptos, Segoe UI, sans-serif`;
        const lines = String(item.text || "").split("\n");
        const lineHeight = fontSize * 1.2;
        lines.forEach((line, index) => {
          const baseline = ((index - ((lines.length - 1) / 2)) * lineHeight);
          context.fillText(line, 0, baseline, width);
        });
      } else if (item.kind === "redact") {
        if (item.redactStyle === "black") {
          context.fillStyle = "#000000";
          context.fillRect(-(width / 2), -(height / 2), width, height);
        } else if (item.redactStyle === "white") {
          context.fillStyle = "#ffffff";
          context.fillRect(-(width / 2), -(height / 2), width, height);
        } else {
          const patch = await loadImageFromDataUrl(createRedactionPatch(previewPage.canvas, item));
          context.drawImage(patch, -(width / 2), -(height / 2), width, height);
        }
      } else {
        const image = await loadImageFromDataUrl(item.dataUrl);
        const fit = fitRect(width, height, item.assetWidth || image.naturalWidth, item.assetHeight || image.naturalHeight);
        context.drawImage(image, -(width / 2) + fit.x, -(height / 2) + fit.y, fit.width, fit.height);
      }
      context.restore();
    }
    return composed;
  }

  function createStudioInspector(studio, options = {}) {
    const inspector = document.createElement("div");
    inspector.className = "result-card";
    inspector.innerHTML = `
      <h3>${options.title || "Elemen Terpilih"}</h3>
      <div class="tool-form-grid compact-grid">
        <label class="tool-field"><span class="tool-label">X</span><input class="tool-input" type="range" min="0" max="100" value="0" id="studio-x"></label>
        <label class="tool-field"><span class="tool-label">Y</span><input class="tool-input" type="range" min="0" max="100" value="0" id="studio-y"></label>
        <label class="tool-field"><span class="tool-label">Lebar</span><input class="tool-input" type="range" min="40" max="520" value="140" id="studio-width"></label>
        <label class="tool-field"><span class="tool-label">Tinggi</span><input class="tool-input" type="range" min="24" max="360" value="60" id="studio-height"></label>
        <label class="tool-field"><span class="tool-label">Rotasi</span><input class="tool-input" type="range" min="-180" max="180" value="0" id="studio-rotation"></label>
        <label class="tool-field"><span class="tool-label">Opacity</span><input class="tool-input" type="range" min="0.1" max="1" step="0.05" value="1" id="studio-opacity"></label>
      </div>
      <div class="action-row"><button class="button secondary-button" type="button" id="studio-delete">Hapus elemen</button></div>
    `;
    ui.extra.prepend(inspector);
    const sync = () => {
      const item = studio.getSelectedItem();
      inspector.classList.toggle("is-disabled", !item);
      inspector.querySelectorAll("input").forEach((element) => { element.disabled = !item; });
      if (!item) return;
      const page = studio.state.previewPages[item.pageIndex];
      const metrics = getDisplayMetrics(page, item);
      inspector.querySelector("#studio-x").max = Math.round(page.displayWidth || page.width);
      inspector.querySelector("#studio-y").max = Math.round(page.displayHeight || page.height);
      inspector.querySelector("#studio-x").value = Math.round(metrics.x);
      inspector.querySelector("#studio-y").value = Math.round(metrics.y);
      inspector.querySelector("#studio-width").value = Math.round(metrics.itemWidth);
      inspector.querySelector("#studio-height").value = Math.round(metrics.itemHeight);
      inspector.querySelector("#studio-rotation").value = Math.round(item.rotation || 0);
      inspector.querySelector("#studio-opacity").value = item.opacity ?? 1;
    };
    ["studio-x", "studio-y", "studio-width", "studio-height", "studio-rotation", "studio-opacity"].forEach((id) => {
      inspector.querySelector(`#${id}`).addEventListener("input", () => {
        const item = studio.getSelectedItem();
        if (!item) return;
        const page = studio.state.previewPages[item.pageIndex];
        const pageWidth = page.displayWidth || page.width || 1;
        const pageHeight = page.displayHeight || page.height || 1;
        const canvasWidth = page.canvas?.width || page.width || 1;
        const canvasHeight = page.canvas?.height || page.height || 1;
        item.canvasX = Number(inspector.querySelector("#studio-x").value) * (canvasWidth / Math.max(pageWidth, 1));
        item.canvasY = Number(inspector.querySelector("#studio-y").value) * (canvasHeight / Math.max(pageHeight, 1));
        item.canvasWidth = Number(inspector.querySelector("#studio-width").value) * (canvasWidth / Math.max(pageWidth, 1));
        item.canvasHeight = Number(inspector.querySelector("#studio-height").value) * (canvasHeight / Math.max(pageHeight, 1));
        syncItemLegacyRatios(page, item);
        syncItemPdfBox(page, item);
        item.rotation = Number(inspector.querySelector("#studio-rotation").value);
        item.opacity = Number(inspector.querySelector("#studio-opacity").value);
        studio.renderItems();
        sync();
      });
    });
    inspector.querySelector("#studio-delete").addEventListener("click", () => {
      studio.removeSelected();
      sync();
      setStatus("Elemen terpilih dihapus dari halaman.");
    });
    studio.state.onSelectionChange = sync;
    return { inspector, sync };
  }

  function buildDefaultStudioItem(overrides = {}) {
    return {
      id: `item-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      pageIndex: overrides.pageIndex ?? 0,
      x: overrides.x ?? 48,
      y: overrides.y ?? 56,
      width: overrides.width ?? 180,
      height: overrides.height ?? 80,
      opacity: overrides.opacity ?? 1,
      rotation: overrides.rotation ?? 0,
      ...overrides,
    };
  }

  function renderDigitalSignaturePdf() {
    const studio = createPdfStudio({
      inputId: "signature-pdf-file",
      listId: "signature-pdf-list",
      uploadLabel: "Unggah PDF untuk tanda tangan",
      uploadNote: "Setelah PDF diunggah, halaman preview langsung tampil dan area editor siap dipakai.",
      modeFields: `
        <label class="tool-field full"><span class="tool-label">Teks tanda tangan</span><input class="tool-input" id="signature-text" type="text" placeholder="Nama lengkap atau paraf"></label>
        <label class="tool-field full"><span class="tool-label">Foto tanda tangan</span><input class="tool-input" id="signature-image" type="file" accept="image/*"></label>
        <label class="tool-field full"><span class="tool-label">Canvas tanda tangan</span><canvas id="signature-pad" class="signature-pad-canvas" width="700" height="220"></canvas></label>
      `,
      actions: `
        <button class="button button-primary" id="signature-add-text" type="button">Tambah Tanda Tangan Ketik</button>
        <button class="button secondary-button" id="signature-add-draw" type="button">Tambah Hasil Draw</button>
        <button class="button secondary-button" id="signature-save" type="button">Save PDF</button>
      `,
      progressTitle: "Progress Digital Signature",
    });
    const inspector = createStudioInspector(studio);
    const pad = document.querySelector("#signature-pad");
    const padContext = pad.getContext("2d");
    padContext.lineWidth = 3.2;
    padContext.lineCap = "round";
    padContext.strokeStyle = "#182433";
    let drawing = false;
    pad.addEventListener("pointerdown", (event) => {
      drawing = true;
      padContext.beginPath();
      const rect = pad.getBoundingClientRect();
      padContext.moveTo((event.clientX - rect.left) * (pad.width / rect.width), (event.clientY - rect.top) * (pad.height / rect.height));
    });
    pad.addEventListener("pointermove", (event) => {
      if (!drawing) return;
      const rect = pad.getBoundingClientRect();
      padContext.lineTo((event.clientX - rect.left) * (pad.width / rect.width), (event.clientY - rect.top) * (pad.height / rect.height));
      padContext.stroke();
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((name) => pad.addEventListener(name, () => { drawing = false; }));
    document.querySelector("#signature-add-text").addEventListener("click", () => {
      if (!studio.state.previewPages.length) return setStatus("Unggah PDF terlebih dahulu.", "warn");
      const text = document.querySelector("#signature-text").value.trim();
      if (!text) return setStatus("Isi teks tanda tangan terlebih dahulu.", "warn");
      const asset = makeSignatureAsset(text, { size: 54, color: "#182433" });
      studio.queuePlacement(({ pageIndex, x, y }) => buildDefaultStudioItem({
        pageIndex,
        x,
        y,
        kind: "image",
        dataUrl: asset.dataUrl,
        assetWidth: asset.width,
        assetHeight: asset.height,
        width: 220,
        height: Math.max(72, 220 * (asset.height / Math.max(asset.width, 1))),
      }), "Klik posisi tanda tangan di preview PDF.");
    });
    document.querySelector("#signature-image").addEventListener("change", async (event) => {
      if (!studio.state.previewPages.length) return setStatus("Unggah PDF terlebih dahulu.", "warn");
      const file = event.target.files[0];
      if (!file) return;
      const dataUrl = await imageFileToDataUrl(file);
      const asset = await createSignatureAssetFromDataUrl(dataUrl, { padding: 14, whiteThreshold: 250 });
      studio.queuePlacement(({ pageIndex, x, y }) => buildDefaultStudioItem({
        pageIndex,
        x,
        y,
        kind: "image",
        dataUrl: asset.dataUrl,
        assetWidth: asset.width,
        assetHeight: asset.height,
        width: 200,
        height: Math.max(72, 200 * (asset.height / Math.max(asset.width, 1))),
      }), "Klik posisi foto tanda tangan di preview PDF.");
    });
    document.querySelector("#signature-add-draw").addEventListener("click", () => {
      if (!studio.state.previewPages.length) return setStatus("Unggah PDF terlebih dahulu.", "warn");
      if (!canvasHasVisibleInk(pad)) return setStatus("Buat tanda tangan draw terlebih dahulu.", "warn");
      const asset = createSignatureAssetFromCanvas(pad, { padding: 18, whiteThreshold: 250 });
      studio.queuePlacement(({ pageIndex, x, y }) => buildDefaultStudioItem({
        pageIndex,
        x,
        y,
        kind: "image",
        dataUrl: asset.dataUrl,
        assetWidth: asset.width,
        assetHeight: asset.height,
        width: 220,
        height: Math.max(72, 220 * (asset.height / Math.max(asset.width, 1))),
      }), "Klik posisi hasil draw di preview PDF.");
    });
    document.querySelector("#signature-save").addEventListener("click", async () => {
      try {
        studio.state.progress.update(4, "Menyiapkan PDF final...");
        const blob = await saveOverlayPdf(studio);
        downloadBlob(blob, "corechiper-signed.pdf");
        studio.state.progress.update(100, "PDF bertanda tangan siap diunduh.");
        setStatus("PDF berhasil diberi tanda tangan digital.");
      } catch (error) {
        setStatus(error.message, "error");
      }
    });
    studio.state.progress.update(0, "Unggah PDF, lalu pilih jenis tanda tangan yang ingin dipasang.");
  }

  function renderWatermarkPdf() {
    ui.workspace.innerHTML = createGenericFileShell({
      inputId: "watermark-file",
      listId: "watermark-list",
      label: "Pilih file PDF",
      accept: ".pdf,application/pdf",
      note: "Watermark akan diterapkan ke semua halaman PDF.",
      preview: true,
      previewClass: "document-preview",
      previewText: "Preview watermark akan tampil pada halaman pertama PDF.",
      fields: `
        <label class="tool-field full"><span class="tool-label">Mode watermark</span><select class="tool-select" id="watermark-mode"><option value="text">Teks</option><option value="image">Gambar</option></select></label>
        <label class="tool-field full"><span class="tool-label">Teks watermark</span><input class="tool-input" id="watermark-text" type="text" value="CONFIDENTIAL"></label>
        <label class="tool-field full"><span class="tool-label">Gambar watermark</span><input class="tool-input" id="watermark-image" type="file" accept="image/*"></label>
        <label class="tool-field"><span class="tool-label">Ukuran</span><input class="tool-input" id="watermark-size" type="range" min="40" max="260" value="120"></label>
        <label class="tool-field"><span class="tool-label">Opacity</span><input class="tool-input" id="watermark-opacity" type="range" min="0.1" max="1" step="0.05" value="0.24"></label>
        <label class="tool-field"><span class="tool-label">Rotasi</span><input class="tool-input" id="watermark-rotation" type="range" min="-180" max="180" value="325"></label>
        <label class="tool-field"><span class="tool-label">Warna teks</span><input class="tool-input" id="watermark-color" type="color" value="#d3541e"></label>
      `,
      actions: `<button class="button button-primary" id="watermark-run" type="button">Save Watermark PDF</button>`,
    });
    const input = document.querySelector("#watermark-file");
    const list = document.querySelector("#watermark-list");
    const preview = document.querySelector("#tool-preview");
    const progress = createProgressCard("Progress Watermark PDF");
    const getWatermarkOptions = async () => {
      const mode = document.querySelector("#watermark-mode").value;
      const size = Number(document.querySelector("#watermark-size").value);
      const opacity = Number(document.querySelector("#watermark-opacity").value);
      const rotation = Number(document.querySelector("#watermark-rotation").value);
      const color = document.querySelector("#watermark-color").value;
      const text = document.querySelector("#watermark-text").value || "WATERMARK";
      const imageFile = document.querySelector("#watermark-image").files[0];
      let imageDataUrl = null;
      let assetWidth = 0;
      let assetHeight = 0;
      if (mode === "image" && imageFile) {
        imageDataUrl = await imageFileToDataUrl(imageFile);
        const asset = await getImageDimensionsFromDataUrl(imageDataUrl);
        assetWidth = asset.width;
        assetHeight = asset.height;
      } else if (mode === "text") {
        const watermarkAsset = createWatermarkTextDataUrl(text, { size, color });
        imageDataUrl = watermarkAsset.dataUrl;
        assetWidth = watermarkAsset.width;
        assetHeight = watermarkAsset.height;
      }
      return {
        mode,
        size,
        opacity,
        rotation,
        color,
        text,
        imageFile,
        imageDataUrl,
        assetWidth,
        assetHeight,
      };
    };
    const refreshPreview = async () => {
      const file = input.files[0];
      if (!file) return;
      const pdfjsLib = await ensureLibrary("pdfjs");
      const pdf = await pdfjsLib.getDocument({ data: await readAsArrayBuffer(file) }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      const options = await getWatermarkOptions();
      if (options.imageDataUrl) {
        const layout = getWatermarkLayout(canvas.width, canvas.height, options);
        const previewOrigin = getCenteredPdfOrigin(layout.centerX, layout.centerY, layout.width, layout.height, options.rotation);
        const watermarkImage = await loadImageFromDataUrl(options.imageDataUrl);
        context.save();
        context.globalAlpha = options.opacity;
        context.translate(previewOrigin.x, previewOrigin.y);
        context.rotate((options.rotation * Math.PI) / 180);
        context.drawImage(watermarkImage, 0, 0, layout.width, layout.height);
        context.restore();
      }
      preview.innerHTML = "";
      preview.appendChild(canvas);
    };
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      if (input.files[0]) await refreshPreview();
    });
    ["#watermark-mode", "#watermark-text", "#watermark-size", "#watermark-opacity", "#watermark-rotation", "#watermark-color"].forEach((selector) => {
      document.querySelector(selector).addEventListener("input", async () => { if (input.files[0]) await refreshPreview(); });
    });
    document.querySelector("#watermark-image").addEventListener("change", refreshPreview);
    document.querySelector("#watermark-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Unggah PDF terlebih dahulu.", "warn");
      try {
        progress.update(8, "Membuka PDF untuk watermark...");
        const { PDFDocument, degrees } = await ensureLibrary("pdfLib");
        const pdf = await PDFDocument.load(await readAsArrayBuffer(file));
        const options = await getWatermarkOptions();
        const image = options.imageDataUrl ? await embedPdfImageFromDataUrl(pdf, options.imageDataUrl) : null;
        pdf.getPages().forEach((page, index) => {
          const { width, height } = page.getSize();
          const layout = getWatermarkLayout(width, height, options);
          if (image) {
            const origin = getCenteredPdfOrigin(layout.centerX, layout.centerY, layout.width, layout.height, options.rotation);
            page.drawImage(image, {
              x: origin.x,
              y: origin.y,
              width: layout.width,
              height: layout.height,
              opacity: options.opacity,
              rotate: degrees(options.rotation),
            });
          }
          progress.update(percentLabel(index + 1, pdf.getPageCount()), `Menerapkan watermark ke halaman ${index + 1}...`);
        });
        downloadBlob(new Blob([await pdf.save()], { type: "application/pdf" }), "corechiper-watermark.pdf");
        progress.update(100, "Watermark selesai diterapkan.");
        setStatus("Watermark PDF berhasil disimpan.");
      } catch (error) {
        setStatus(error.message, "error");
      }
    });
  }

  function renderRotatePdf() {
    ui.workspace.innerHTML = createGenericFileShell({
      inputId: "rotate-file",
      listId: "rotate-list",
      label: "Pilih file PDF",
      accept: ".pdf,application/pdf",
      note: "Anda bisa memutar semua halaman atau hanya halaman tertentu.",
      preview: true,
      previewText: "Preview halaman pertama akan ikut berputar.",
      fields: `
        <label class="tool-field"><span class="tool-label">Derajat</span><select class="tool-select" id="rotate-angle"><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select></label>
        <label class="tool-field"><span class="tool-label">Halaman</span><input class="tool-input" id="rotate-pages" type="text" placeholder="Kosongkan untuk semua halaman"></label>
      `,
      actions: `<button class="button button-primary" id="rotate-run" type="button">Rotate PDF</button>`,
    });
    const input = document.querySelector("#rotate-file");
    const list = document.querySelector("#rotate-list");
    const preview = document.querySelector("#tool-preview");
    const progress = createProgressCard("Progress Rotate PDF");
    const renderPreview = async () => {
      const file = input.files[0];
      if (!file) return;
      const pdfjsLib = await ensureLibrary("pdfjs");
      const pdf = await pdfjsLib.getDocument({ data: await readAsArrayBuffer(file) }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      canvas.style.transform = `rotate(${document.querySelector("#rotate-angle").value}deg)`;
      preview.innerHTML = "";
      preview.appendChild(canvas);
    };
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      await renderPreview();
    });
    document.querySelector("#rotate-angle").addEventListener("change", renderPreview);
    document.querySelector("#rotate-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Unggah PDF terlebih dahulu.", "warn");
      try {
        const { PDFDocument, degrees } = await ensureLibrary("pdfLib");
        const pdf = await PDFDocument.load(await readAsArrayBuffer(file));
        const pages = document.querySelector("#rotate-pages").value.trim()
          ? parseRanges(document.querySelector("#rotate-pages").value, pdf.getPageCount()).flat()
          : pdf.getPageIndices().map((pageIndex) => pageIndex + 1);
        pages.forEach((pageNumber, index) => {
          pdf.getPage(pageNumber - 1).setRotation(degrees(Number(document.querySelector("#rotate-angle").value)));
          progress.update(percentLabel(index + 1, pages.length), `Memutar halaman ${pageNumber}...`);
        });
        downloadBlob(new Blob([await pdf.save()], { type: "application/pdf" }), "corechiper-rotated.pdf");
        progress.update(100, "Rotasi PDF selesai.");
        setStatus("Rotasi PDF berhasil disimpan.");
      } catch (error) {
        setStatus(error.message, "error");
      }
    });
  }

  function renderPdfRedactor() {
    const studio = createPdfStudio({
      inputId: "redactor-file",
      listId: "redactor-list",
      uploadLabel: "Unggah PDF untuk disensor",
      uploadNote: "Tambahkan kotak sensor, lalu simpan hasil aman yang sudah di-flatten agar teks asli tidak bisa disalin lagi.",
      modeFields: `
        <label class="tool-field"><span class="tool-label">Gaya sensor</span><select class="tool-select" id="redact-style"><option value="black">Dihitamkan</option><option value="white">Diputihkan</option><option value="blur">Blur</option><option value="glitch">Glitch</option></select></label>
        <label class="tool-field"><span class="tool-label">Lebar awal</span><input class="tool-input" id="redact-width" type="number" min="60" max="420" value="180"></label>
        <label class="tool-field"><span class="tool-label">Tinggi awal</span><input class="tool-input" id="redact-height" type="number" min="24" max="220" value="54"></label>
      `,
      actions: `
        <button class="button button-primary" id="redact-add" type="button">Tambah Area Sensor</button>
        <button class="button secondary-button" id="redact-save" type="button">Save Secure Redacted PDF</button>
      `,
      progressTitle: "Progress PDF Redactor",
    });
    const inspector = createStudioInspector(studio, { title: "Area Sensor Terpilih" });
    document.querySelector("#redact-add").addEventListener("click", () => {
      if (!studio.state.previewPages.length) return setStatus("Unggah PDF terlebih dahulu.", "warn");
      const redactStyle = document.querySelector("#redact-style").value;
      const width = Number(document.querySelector("#redact-width").value);
      const height = Number(document.querySelector("#redact-height").value);
      studio.queuePlacement(({ pageIndex, x, y }) => buildDefaultStudioItem({
        pageIndex,
        x,
        y,
        kind: "redact",
        redactStyle,
        width,
        height,
      }), "Klik area PDF untuk menaruh kotak sensor di posisi kursor.");
    });
    document.querySelector("#redact-save").addEventListener("click", async () => {
      try {
        const blob = await saveOverlayPdf(studio, { flattenOutput: true, renderScale: 4.5 });
        downloadBlob(blob, "corechiper-redacted.pdf");
        studio.state.progress.update(100, "PDF sensor aman selesai dibuat.");
        setStatus("PDF redactor selesai diproses. Hasil sudah di-flatten aman dengan kualitas ekspor maksimum yang didukung browser.");
      } catch (error) {
        setStatus(error.message, "error");
      }
    });
  }

  function renderSmartPdfEditor() {
    const studio = createPdfStudio({
      inputId: "smart-pdf-file",
      listId: "smart-pdf-list",
      uploadLabel: "Unggah PDF untuk diedit",
      uploadNote: "Mini Canva untuk PDF: tambah teks, gambar, draw, dan tanda tangan, lalu drag sesuai posisi.",
      previewToolbar: `
        <div class="smart-toolbar">
          <div class="smart-toolbar-group">
            <span class="smart-toolbar-label">Tambah</span>
            <button class="toolbar-btn primary" id="smart-add-text" type="button">Text</button>
            <button class="toolbar-btn" id="smart-add-image" type="button">Image</button>
            <button class="toolbar-btn" id="smart-add-draw" type="button">Draw</button>
            <button class="toolbar-btn" id="smart-add-sign" type="button">Signature</button>
          </div>
          <div class="smart-toolbar-group">
            <span class="smart-toolbar-label">Edit Teks</span>
            <input class="tool-input toolbar-input" id="smart-toolbar-text" type="text" placeholder="Edit teks terpilih">
            <input class="tool-input toolbar-input toolbar-number" id="smart-toolbar-font-size" type="number" min="14" max="120" value="28">
            <input class="tool-input toolbar-input toolbar-color" id="smart-toolbar-text-color" type="color" value="#182433">
          </div>
          <div class="smart-toolbar-group">
            <button class="toolbar-btn success" id="smart-save" type="button">Save PDF</button>
          </div>
        </div>
      `,
      modeFields: `
        <label class="tool-field full"><span class="tool-label">Teks baru</span><input class="tool-input" id="smart-text" type="text" placeholder="Tulis teks yang ingin ditambahkan"></label>
        <label class="tool-field"><span class="tool-label">Ukuran font</span><input class="tool-input" id="smart-font-size" type="number" min="14" max="96" value="28"></label>
        <label class="tool-field"><span class="tool-label">Warna teks</span><input class="tool-input" id="smart-text-color" type="color" value="#182433"></label>
        <label class="tool-field full"><span class="tool-label">Gambar</span><input class="tool-input" id="smart-image" type="file" accept="image/*"></label>
        <label class="tool-field full"><span class="tool-label">Tanda tangan ketik</span><input class="tool-input" id="smart-signature" type="text" placeholder="Nama atau paraf"></label>
        <label class="tool-field full"><span class="tool-label">Canvas draw</span><canvas id="smart-pad" class="signature-pad-canvas" width="700" height="220"></canvas></label>
      `,
      actions: `
        <button class="button button-primary" id="smart-add-text-side" type="button">Tambah Text</button>
        <button class="button secondary-button" id="smart-add-image-side" type="button">Tambah Image</button>
        <button class="button secondary-button" id="smart-add-draw-side" type="button">Tambah Draw</button>
        <button class="button secondary-button" id="smart-add-sign-side" type="button">Tambah Signature</button>
      `,
      progressTitle: "Progress Smart PDF Editor",
    });
    const inspector = createStudioInspector(studio, { title: "Elemen Smart Editor" });
    const toolbarText = document.querySelector("#smart-toolbar-text");
    const toolbarFontSize = document.querySelector("#smart-toolbar-font-size");
    const toolbarColor = document.querySelector("#smart-toolbar-text-color");
    const pad = document.querySelector("#smart-pad");
    const ctx = pad.getContext("2d");
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#182433";
    let drawing = false;
    pad.addEventListener("pointerdown", (event) => {
      drawing = true;
      const rect = pad.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo((event.clientX - rect.left) * (pad.width / rect.width), (event.clientY - rect.top) * (pad.height / rect.height));
    });
    pad.addEventListener("pointermove", (event) => {
      if (!drawing) return;
      const rect = pad.getBoundingClientRect();
      ctx.lineTo((event.clientX - rect.left) * (pad.width / rect.width), (event.clientY - rect.top) * (pad.height / rect.height));
      ctx.stroke();
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((name) => pad.addEventListener(name, () => { drawing = false; }));
    const queueTextPlacement = () => {
      if (!studio.state.previewPages.length) return setStatus("Unggah PDF terlebih dahulu.", "warn");
      const text = (toolbarText.value || document.querySelector("#smart-text").value).trim();
      if (!text) return setStatus("Isi teks terlebih dahulu.", "warn");
      const color = toolbarColor.value || document.querySelector("#smart-text-color").value;
      const fontSize = Number(toolbarFontSize.value || document.querySelector("#smart-font-size").value);
      studio.queuePlacement(({ pageIndex, x, y }) => buildDefaultStudioItem({
        pageIndex,
        x,
        y,
        kind: "text",
        text,
        color,
        fontSize,
        width: 260,
        height: 80,
      }), "Klik posisi teks di preview PDF.");
    };
    const queueImagePlacement = async () => {
      if (!studio.state.previewPages.length) return setStatus("Unggah PDF terlebih dahulu.", "warn");
      const file = document.querySelector("#smart-image").files[0];
      if (!file) return setStatus("Pilih gambar terlebih dahulu.", "warn");
      const dataUrl = await imageFileToDataUrl(file);
      const asset = await getImageDimensionsFromDataUrl(dataUrl);
      studio.queuePlacement(({ pageIndex, x, y }) => buildDefaultStudioItem({
        pageIndex,
        x,
        y,
        kind: "image",
        dataUrl,
        assetWidth: asset.width,
        assetHeight: asset.height,
        width: 190,
        height: 120,
      }), "Klik posisi gambar di preview PDF.");
    };
    const queueDrawPlacement = () => {
      if (!studio.state.previewPages.length) return setStatus("Unggah PDF terlebih dahulu.", "warn");
      if (!canvasHasVisibleInk(pad)) return setStatus("Buat hasil draw terlebih dahulu.", "warn");
      const asset = createSignatureAssetFromCanvas(pad, { padding: 18, whiteThreshold: 250 });
      studio.queuePlacement(({ pageIndex, x, y }) => buildDefaultStudioItem({
        pageIndex,
        x,
        y,
        kind: "image",
        dataUrl: asset.dataUrl,
        assetWidth: asset.width,
        assetHeight: asset.height,
        width: 240,
        height: Math.max(80, 240 * (asset.height / Math.max(asset.width, 1))),
      }), "Klik posisi hasil draw di preview PDF.");
    };
    const queueSignaturePlacement = () => {
      if (!studio.state.previewPages.length) return setStatus("Unggah PDF terlebih dahulu.", "warn");
      const text = document.querySelector("#smart-signature").value.trim();
      if (!text) return setStatus("Isi tanda tangan ketik terlebih dahulu.", "warn");
      const asset = makeSignatureAsset(text, { size: 50, color: "#0f172a" });
      studio.queuePlacement(({ pageIndex, x, y }) => buildDefaultStudioItem({
        pageIndex,
        x,
        y,
        kind: "image",
        dataUrl: asset.dataUrl,
        assetWidth: asset.width,
        assetHeight: asset.height,
        width: 220,
        height: Math.max(72, 220 * (asset.height / Math.max(asset.width, 1))),
      }), "Klik posisi signature di preview PDF.");
    };
    ["#smart-add-text", "#smart-add-text-side"].forEach((selector) => document.querySelector(selector).addEventListener("click", queueTextPlacement));
    ["#smart-add-image", "#smart-add-image-side"].forEach((selector) => document.querySelector(selector).addEventListener("click", () => { queueImagePlacement().catch((error) => setStatus(error.message, "error")); }));
    ["#smart-add-draw", "#smart-add-draw-side"].forEach((selector) => document.querySelector(selector).addEventListener("click", queueDrawPlacement));
    ["#smart-add-sign", "#smart-add-sign-side"].forEach((selector) => document.querySelector(selector).addEventListener("click", queueSignaturePlacement));
    const syncToolbar = () => {
      const item = studio.getSelectedItem();
      const isText = item?.kind === "text";
      toolbarText.disabled = !isText;
      toolbarFontSize.disabled = !isText;
      toolbarColor.disabled = !isText;
      if (!isText) return;
      toolbarText.value = item.text || "";
      toolbarFontSize.value = item.fontSize || 28;
      toolbarColor.value = item.color || "#182433";
    };
    studio.state.onSelectionChange = (item) => {
      inspector.sync();
      syncToolbar(item);
    };
    [toolbarText, toolbarFontSize, toolbarColor].forEach((field) => {
      field.addEventListener("input", () => {
        const item = studio.getSelectedItem();
        if (!item || item.kind !== "text") return;
        item.text = toolbarText.value;
        item.fontSize = Number(toolbarFontSize.value);
        item.color = toolbarColor.value;
        studio.renderItems();
      });
    });
    syncToolbar();
    document.querySelector("#smart-save").addEventListener("click", async () => {
      try {
        const blob = await saveOverlayPdf(studio);
        downloadBlob(blob, "corechiper-smart-pdf.pdf");
        studio.state.progress.update(100, "Smart PDF Editor selesai menyimpan.");
        setStatus("Smart PDF Editor berhasil menyimpan perubahan.");
      } catch (error) {
        setStatus(error.message, "error");
      }
    });
  }

  function renderLockPdf() {
    ui.workspace.innerHTML = createGenericFileShell({
      inputId: "lock-file",
      listId: "lock-list",
      label: "Pilih file PDF",
      accept: ".pdf,application/pdf",
      note: "Gunakan mode lock untuk menambahkan password, atau unlock untuk membuat salinan tanpa password.",
      preview: true,
      previewText: "Preview halaman pertama PDF tampil di sini.",
      fields: `
        <label class="tool-field"><span class="tool-label">Mode</span><select class="tool-select" id="lock-mode"><option value="lock">Lock PDF</option><option value="unlock">Unlock PDF</option></select></label>
        <label class="tool-field"><span class="tool-label">Password user</span><input class="tool-input" id="lock-password" type="password" placeholder="Masukkan password"></label>
        <label class="tool-field"><span class="tool-label">Owner password</span><input class="tool-input" id="lock-owner" type="password" placeholder="Opsional untuk lock"></label>
      `,
      actions: `<button class="button button-primary" id="lock-run" type="button">Proses PDF</button>`,
    });
    const input = document.querySelector("#lock-file");
    const list = document.querySelector("#lock-list");
    const preview = document.querySelector("#tool-preview");
    const progress = createProgressCard("Progress Lock / Unlock PDF");
    const previewFirstPage = async () => {
      const file = input.files[0];
      if (!file) return;
      const pdfjsLib = await ensureLibrary("pdfjs");
      const password = document.querySelector("#lock-mode").value === "unlock" ? document.querySelector("#lock-password").value : undefined;
      const pdf = await pdfjsLib.getDocument({ data: await readAsArrayBuffer(file), password }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      preview.innerHTML = "";
      preview.appendChild(canvas);
    };
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      try { await previewFirstPage(); } catch (error) { setStatus("Preview menunggu password yang tepat untuk dibuka.", "warn"); }
    });
    document.querySelector("#lock-mode").addEventListener("change", previewFirstPage);
    document.querySelector("#lock-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih PDF terlebih dahulu.", "warn");
      const mode = document.querySelector("#lock-mode").value;
      const userPassword = document.querySelector("#lock-password").value;
      if (!userPassword) return setStatus("Isi password terlebih dahulu.", "warn");
      try {
        const pdfjsLib = await ensureLibrary("pdfjs");
        const { jsPDF } = (await ensureLibrary("jspdf")).jsPDF ? (await ensureLibrary("jspdf")) : window.jspdf;
        const pdf = await pdfjsLib.getDocument({ data: await readAsArrayBuffer(file), password: mode === "unlock" ? userPassword : undefined }).promise;
        const output = new jsPDF({
          unit: "pt",
          format: "a4",
          orientation: "portrait",
          encryption: mode === "lock" ? {
            userPassword,
            ownerPassword: document.querySelector("#lock-owner").value || userPassword,
            userPermissions: ["print"],
          } : undefined,
        });
        for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
          const page = await pdf.getPage(pageIndex);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          const img = canvas.toDataURL("image/jpeg", 0.96);
          if (pageIndex > 1) output.addPage();
          output.addImage(img, "JPEG", 18, 18, 559, 806);
          progress.update(percentLabel(pageIndex, pdf.numPages), `${mode === "lock" ? "Mengunci" : "Membuka"} halaman ${pageIndex}...`);
        }
        output.save(mode === "lock" ? "corechiper-locked.pdf" : "corechiper-unlocked.pdf");
        progress.update(100, "Proses lock / unlock selesai.");
        setStatus(mode === "lock" ? "PDF berhasil dibuat dalam versi terkunci." : "Salinan PDF tanpa password berhasil dibuat.");
      } catch (error) {
        setStatus("Gagal memproses lock / unlock PDF. Periksa password atau file sumber.", "error");
      }
    });
  }

  function renderQrScanner() {
    ui.workspace.innerHTML = createGenericFileShell({
      inputId: "qr-scan-file",
      listId: "qr-scan-list",
      label: "Upload foto QR code",
      accept: "image/*",
      note: "Begitu foto QR dimasukkan, scanner akan membaca otomatis.",
      preview: true,
      previewText: "Preview gambar QR tampil di sini.",
      actions: `<button class="button button-primary" id="qr-scan-run" type="button">Scan QR Sekarang</button>`,
    }) + `<div class="result-card"><h3>Hasil Scan</h3><div class="metric-highlight" id="qr-scan-result">-</div><p class="small-note" id="qr-scan-note">Belum ada hasil scan.</p></div>`;
    const input = document.querySelector("#qr-scan-file");
    const list = document.querySelector("#qr-scan-list");
    const preview = document.querySelector("#tool-preview");
    const result = document.querySelector("#qr-scan-result");
    const note = document.querySelector("#qr-scan-note");
    const scan = async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih gambar QR terlebih dahulu.", "warn");
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      context.drawImage(img, 0, 0);
      preview.innerHTML = "";
      preview.appendChild(canvas);
      const jsQR = await ensureLibrary("jsqr");
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (!code) {
        result.textContent = "Tidak terbaca";
        note.textContent = "Coba upload gambar yang lebih tajam atau crop lebih dekat ke QR.";
        return setStatus("QR code belum berhasil dibaca.", "warn");
      }
      result.textContent = code.data;
      note.innerHTML = /^https?:\/\//i.test(code.data)
        ? `Link terdeteksi: <a href="${code.data}" target="_blank" rel="noopener">${code.data}</a>`
        : "Pesan QR berhasil dibaca.";
      setStatus("QR code berhasil discan.");
    };
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      if (input.files[0]) await scan();
    });
    document.querySelector("#qr-scan-run").addEventListener("click", () => { scan().catch((error) => setStatus(error.message, "error")); });
  }

  function renderFaviconGenerator() {
    ui.workspace.innerHTML = createGenericFileShell({
      inputId: "favicon-file",
      listId: "favicon-list",
      label: "Upload gambar untuk favicon",
      accept: "image/*",
      note: "Gambar akan diubah menjadi paket favicon ICO dan PNG multi-size.",
      preview: true,
      previewText: "Preview ukuran favicon akan muncul di sini.",
      actions: `<button class="button button-primary" id="favicon-run" type="button">Generate Favicon</button>`,
    });
    const input = document.querySelector("#favicon-file");
    const list = document.querySelector("#favicon-list");
    const preview = document.querySelector("#tool-preview");
    const progress = createProgressCard("Progress Favicon Generator");
    input.addEventListener("change", () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
    });
    document.querySelector("#favicon-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih gambar terlebih dahulu.", "warn");
      try {
        const image = await loadImageFromFile(file);
        const JSZip = await ensureLibrary("jszip");
        const sizes = [16, 32, 48, 64, 128, 180, 192, 512];
        const zip = new JSZip();
        const pngEntries = [];
        preview.innerHTML = '<div class="favicon-grid"></div>';
        const grid = preview.querySelector(".favicon-grid");
        for (let index = 0; index < sizes.length; index += 1) {
          const size = sizes[index];
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const context = canvas.getContext("2d");
          context.clearRect(0, 0, size, size);
          context.drawImage(image, 0, 0, size, size);
          const blob = await canvasToBlob(canvas, "image/png");
          pngEntries.push({ size, blob });
          zip.file(`favicon-${size}x${size}.png`, blob);
          const card = document.createElement("div");
          card.className = "favicon-card";
          card.innerHTML = `<div class="favicon-size">${size}×${size}</div>`;
          card.appendChild(canvas);
          grid.appendChild(card);
          progress.update(percentLabel(index + 1, sizes.length), `Membuat favicon ukuran ${size}...`);
        }
        const ico = await createIcoBlobFromPngBlobs(pngEntries.filter((entry) => entry.size <= 64));
        zip.file("favicon.ico", ico);
        downloadBlob(await zip.generateAsync({ type: "blob" }), "corechiper-favicon-pack.zip");
        progress.update(100, "Paket favicon siap diunduh.");
        setStatus("Favicon ICO dan ukuran PNG berhasil dibuat.");
      } catch (error) {
        setStatus(error.message, "error");
      }
    });
  }

  function renderUrlEncoderDecoder() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">Input URL / text</span><textarea class="tool-textarea" id="url-code-input" placeholder="Masukkan URL, query string, atau text di sini..."></textarea></label><label class="tool-field full"><span class="tool-label">Output</span><textarea class="tool-textarea" id="url-code-output"></textarea></label></div><div class="action-row"><button class="button button-primary" id="url-encode" type="button">Encode</button><button class="button secondary-button" id="url-decode" type="button">Decode</button><button class="button secondary-button" id="url-copy" type="button">Salin Hasil</button></div>`;
    const input = document.querySelector("#url-code-input");
    const output = document.querySelector("#url-code-output");
    document.querySelector("#url-encode").addEventListener("click", () => {
      output.value = encodeURIComponent(input.value);
      setStatus("Teks berhasil di-encode.");
    });
    document.querySelector("#url-decode").addEventListener("click", () => {
      try {
        output.value = decodeURIComponent(input.value);
        setStatus("Teks berhasil di-decode.");
      } catch (error) {
        setStatus(`Gagal decode URL: ${error.message}`, "error");
      }
    });
    document.querySelector("#url-copy").addEventListener("click", async () => {
      if (!output.value) return setStatus("Belum ada hasil untuk disalin.", "warn");
      await navigator.clipboard.writeText(output.value);
      setStatus("Hasil URL berhasil disalin.");
    });
  }

  function renderBase64EncoderDecoder() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">Input text</span><textarea class="tool-textarea" id="base64-input" placeholder="Masukkan teks biasa atau Base64..."></textarea></label><label class="tool-field full"><span class="tool-label">Output</span><textarea class="tool-textarea" id="base64-output"></textarea></label></div><div class="action-row"><button class="button button-primary" id="base64-encode" type="button">Encode</button><button class="button secondary-button" id="base64-decode" type="button">Decode</button><button class="button secondary-button" id="base64-copy" type="button">Salin Hasil</button></div>`;
    const input = document.querySelector("#base64-input");
    const output = document.querySelector("#base64-output");
    document.querySelector("#base64-encode").addEventListener("click", () => {
      output.value = utf8ToBase64(input.value);
      setStatus("Teks berhasil diubah ke Base64.");
    });
    document.querySelector("#base64-decode").addEventListener("click", () => {
      try {
        output.value = base64ToUtf8(input.value.trim());
        setStatus("Base64 berhasil di-decode.");
      } catch (error) {
        setStatus(`Gagal decode Base64: ${error.message}`, "error");
      }
    });
    document.querySelector("#base64-copy").addEventListener("click", async () => {
      if (!output.value) return setStatus("Belum ada hasil untuk disalin.", "warn");
      await navigator.clipboard.writeText(output.value);
      setStatus("Hasil Base64 berhasil disalin.");
    });
  }

  function renderUuidGenerator() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field"><span class="tool-label">Jumlah UUID</span><input class="tool-input" id="uuid-count" type="number" min="1" max="100" value="5"></label><label class="tool-field"><span class="tool-label">Catatan</span><div class="result-card"><p class="small-note">Generate UUID v4 untuk API, database, token internal, atau testing.</p></div></label><label class="tool-field full"><span class="tool-label">UUID hasil</span><textarea class="tool-textarea" id="uuid-output"></textarea></label></div><div class="action-row"><button class="button button-primary" id="uuid-run" type="button">Generate UUID</button><button class="button secondary-button" id="uuid-copy" type="button">Salin Semua</button></div>`;
    const output = document.querySelector("#uuid-output");
    const generate = () => {
      const count = clamp(Number(document.querySelector("#uuid-count").value) || 1, 1, 100);
      output.value = Array.from({ length: count }, () => crypto.randomUUID()).join("\n");
      setStatus(`${count} UUID berhasil dibuat.`);
    };
    document.querySelector("#uuid-run").addEventListener("click", generate);
    document.querySelector("#uuid-copy").addEventListener("click", async () => {
      if (!output.value) generate();
      await navigator.clipboard.writeText(output.value);
      setStatus("UUID berhasil disalin.");
    });
    generate();
  }

  function renderSlugGenerator() {
    ui.workspace.innerHTML = html`<div class="tool-form-grid"><label class="tool-field full"><span class="tool-label">Judul / keyword</span><textarea class="tool-textarea" id="slug-input" placeholder="Contoh: Cara Optimasi Gambar untuk SEO 2026"></textarea></label><label class="tool-field"><span class="tool-label">Pemisah</span><select class="tool-select" id="slug-separator"><option value="-">Hyphen (-)</option><option value="_">Underscore (_)</option></select></label><label class="tool-field full"><span class="tool-label">Slug output</span><textarea class="tool-textarea" id="slug-output"></textarea></label></div><div class="action-row"><button class="button button-primary" id="slug-run" type="button">Generate Slug</button><button class="button secondary-button" id="slug-copy" type="button">Salin Slug</button></div>`;
    const input = document.querySelector("#slug-input");
    const output = document.querySelector("#slug-output");
    const generate = () => {
      output.value = slugify(input.value, document.querySelector("#slug-separator").value);
      setStatus(output.value ? "Slug SEO-friendly berhasil dibuat." : "Masukkan judul atau keyword terlebih dahulu.", output.value ? "info" : "warn");
    };
    input.addEventListener("input", generate);
    document.querySelector("#slug-run").addEventListener("click", generate);
    document.querySelector("#slug-copy").addEventListener("click", async () => {
      if (!output.value) generate();
      if (!output.value) return;
      await navigator.clipboard.writeText(output.value);
      setStatus("Slug berhasil disalin.");
    });
  }

  function renderCanvasImageTool(options) {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "canvas-image-file", listId: "canvas-image-list", label: "Pilih file gambar", accept: "image/*", note: "Unggah gambar dari perangkat Anda." })}${options.extraFields || ""}</div><div class="tool-preview" id="tool-preview"><p class="small-note">Preview hasil akan tampil di sini.</p></div><div class="action-row"><button class="button button-primary" id="canvas-image-run" type="button">${options.buttonLabel}</button></div>`;
    const input = document.querySelector("#canvas-image-file");
    const list = document.querySelector("#canvas-image-list");
    input.addEventListener("change", async () => {
      list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`;
      const file = input.files[0];
      if (!file) return;
      const image = await loadImageFromFile(file);
      showPreview(image);
      if (typeof options.onLoaded === "function") options.onLoaded(image);
    });
    document.querySelector("#canvas-image-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file gambar terlebih dahulu.", "warn");
      try {
        setStatus("Memproses gambar...");
        const image = await loadImageFromFile(file);
        const canvas = document.createElement("canvas");
        const result = await options.onRun({ image, canvas, file });
        showPreview(canvas);
        downloadBlob(result.blob, result.filename);
        setStatus("Gambar berhasil diproses.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function renderSpecialConvertTool(format, filename, note, accept = "image/jpeg,image/jpg,image/png") {
    ui.workspace.innerHTML = html`<div class="tool-form-grid">${inputFileTemplate({ id: "special-convert-file", listId: "special-convert-list", label: "Pilih gambar", accept, note })}</div><div class="tool-preview" id="tool-preview"><p class="small-note">Preview hasil akan tampil di sini.</p></div><div class="action-row"><button class="button button-primary" id="special-convert-run" type="button">Konversi</button></div>`;
    const input = document.querySelector("#special-convert-file");
    const list = document.querySelector("#special-convert-list");
    input.addEventListener("change", () => { list.innerHTML = `<strong>File siap diproses</strong>${fileChipList([...input.files])}`; });
    document.querySelector("#special-convert-run").addEventListener("click", async () => {
      const file = input.files[0];
      if (!file) return setStatus("Pilih file gambar terlebih dahulu.", "warn");
      try {
        setStatus("Mengonversi gambar...");
        const image = await loadImageFromFile(file);
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        canvas.getContext("2d").drawImage(image, 0, 0);
        showPreview(canvas);
        downloadBlob(await canvasToBlob(canvas, format, 0.92), filename);
        setStatus("Gambar berhasil dikonversi.");
      } catch (error) { setStatus(error.message, "error"); }
    });
  }

  function removeBackgroundFromCanvas(canvas, options = {}) {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;
    const background = sampleBackgroundColor(data, width, height);
    const tolerance = options.tolerance ?? 48;
    const feather = options.feather ?? 8;
    for (let offset = 0; offset < data.length; offset += 4) {
      const distance = colorDistance(data[offset], data[offset + 1], data[offset + 2], background.r, background.g, background.b);
      if (distance <= tolerance) data[offset + 3] = 0;
      else if (distance <= tolerance + feather) data[offset + 3] = Math.min(data[offset + 3], Math.round(((distance - tolerance) / Math.max(feather, 1)) * 255));
    }
    context.putImageData(imageData, 0, 0);
  }

  function sampleBackgroundColor(data, width, height) {
    const points = [
      [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1],
      [Math.floor(width / 2), 0], [0, Math.floor(height / 2)], [width - 1, Math.floor(height / 2)], [Math.floor(width / 2), height - 1],
    ];
    const total = points.reduce((acc, [x, y]) => {
      const offset = ((y * width) + x) * 4;
      acc.r += data[offset];
      acc.g += data[offset + 1];
      acc.b += data[offset + 2];
      return acc;
    }, { r: 0, g: 0, b: 0 });
    return { r: total.r / points.length, g: total.g / points.length, b: total.b / points.length };
  }

  function colorDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt(((r1 - r2) ** 2) + ((g1 - g2) ** 2) + ((b1 - b2) ** 2));
  }

  function drawTextWatermark(context, canvas, options) {
    const padding = Math.max(18, canvas.width * 0.025);
    const fontSize = options.fontSize || 36;
    context.save();
    context.globalAlpha = options.opacity ?? 0.35;
    context.fillStyle = options.color || "#ffffff";
    context.font = `700 ${fontSize}px Arial, sans-serif`;
    context.textBaseline = "bottom";
    const text = options.text || "";
    const metrics = context.measureText(text);
    let x = padding;
    let y = canvas.height - padding;
    if (options.position === "bottom-right") x = canvas.width - metrics.width - padding;
    if (options.position === "top-left") y = fontSize + padding;
    if (options.position === "top-right") {
      x = canvas.width - metrics.width - padding;
      y = fontSize + padding;
    }
    if (options.position === "center") {
      x = (canvas.width - metrics.width) / 2;
      y = (canvas.height + fontSize * 0.4) / 2;
    }
    context.fillText(text, x, y);
    context.restore();
  }

  function applySharpen(canvas, amount = 0.35) {
    if (!amount) return;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const source = context.getImageData(0, 0, canvas.width, canvas.height);
    const output = context.createImageData(source);
    const { data, width, height } = source;
    const out = output.data;
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        let r = 0; let g = 0; let b = 0; let kernelIndex = 0;
        for (let ky = -1; ky <= 1; ky += 1) {
          for (let kx = -1; kx <= 1; kx += 1) {
            const offset = (((y + ky) * width) + (x + kx)) * 4;
            const weight = kernel[kernelIndex];
            r += data[offset] * weight;
            g += data[offset + 1] * weight;
            b += data[offset + 2] * weight;
            kernelIndex += 1;
          }
        }
        const offset = ((y * width) + x) * 4;
        out[offset] = clamp(data[offset] + ((r - data[offset]) * amount), 0, 255);
        out[offset + 1] = clamp(data[offset + 1] + ((g - data[offset + 1]) * amount), 0, 255);
        out[offset + 2] = clamp(data[offset + 2] + ((b - data[offset + 2]) * amount), 0, 255);
        out[offset + 3] = data[offset + 3];
      }
    }
    context.putImageData(output, 0, 0);
  }

  function applyPixelateEffect(context, image, width, height, blockSize) {
    const scaledWidth = Math.max(1, Math.round(width / blockSize));
    const scaledHeight = Math.max(1, Math.round(height / blockSize));
    const temp = document.createElement("canvas");
    temp.width = scaledWidth;
    temp.height = scaledHeight;
    const tempContext = temp.getContext("2d");
    tempContext.imageSmoothingEnabled = false;
    tempContext.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    context.imageSmoothingEnabled = false;
    context.drawImage(temp, 0, 0, scaledWidth, scaledHeight, 0, 0, width, height);
    context.imageSmoothingEnabled = true;
  }

  function buildLineDiff(left, right) {
    const dp = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));
    for (let i = left.length - 1; i >= 0; i -= 1) {
      for (let j = right.length - 1; j >= 0; j -= 1) {
        dp[i][j] = left[i] === right[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const result = [];
    let i = 0;
    let j = 0;
    while (i < left.length && j < right.length) {
      if (left[i] === right[j]) {
        result.push({ type: "same", left: left[i], right: right[j] });
        i += 1;
        j += 1;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        result.push({ type: "removed", left: left[i], right: "" });
        i += 1;
      } else {
        result.push({ type: "added", left: "", right: right[j] });
        j += 1;
      }
    }
    while (i < left.length) {
      result.push({ type: "removed", left: left[i], right: "" });
      i += 1;
    }
    while (j < right.length) {
      result.push({ type: "added", left: "", right: right[j] });
      j += 1;
    }
    return result;
  }

  function renderDiffColumn(diff, side) {
    return `<div class="diff-lines">${diff.map((item) => {
      const value = side === "left" ? item.left : item.right;
      return `<div class="diff-line ${item.type}"><span>${escapeHtml(value || "\u00A0")}</span></div>`;
    }).join("")}</div>`;
  }

  function utf8ToBase64(value) {
    return btoa(String.fromCharCode(...new TextEncoder().encode(value)));
  }

  function base64ToUtf8(value) {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function convertCurrency(amount, from, to) {
    const idrValue = amount * (CURRENCY_RATES[from] || 1);
    return idrValue / (CURRENCY_RATES[to] || 1);
  }

  function convertUnit(category, value, from, to) {
    if (category === "temperature") {
      const celsius = convertTemperatureToCelsius(value, from);
      return convertCelsiusToTemperature(celsius, to);
    }
    const group = UNIT_OPTIONS[category];
    const baseValue = value * group[from].factor;
    return baseValue / group[to].factor;
  }

  function convertTemperatureToCelsius(value, unit) {
    if (unit === "fahrenheit") return (value - 32) * (5 / 9);
    if (unit === "kelvin") return value - 273.15;
    return value;
  }

  function convertCelsiusToTemperature(value, unit) {
    if (unit === "fahrenheit") return (value * (9 / 5)) + 32;
    if (unit === "kelvin") return value + 273.15;
    return value;
  }

  function calculateAgeDetails(birthValue, targetValue) {
    const birth = new Date(`${birthValue}T00:00:00`);
    const target = new Date(`${targetValue}T00:00:00`);
    if (Number.isNaN(birth.getTime()) || Number.isNaN(target.getTime()) || target < birth) return null;

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      const previousMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
      days += previousMonthLastDay;
      months -= 1;
    }
    if (months < 0) {
      months += 12;
      years -= 1;
    }

    const totalDays = Math.floor((target - birth) / 86400000);
    const nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < target) nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
    const nextBirthdayIn = Math.ceil((nextBirthday - target) / 86400000);

    return { years, months, days, totalDays, nextBirthdayIn };
  }

  function formatDisplayDate(value) {
    return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function slugify(value, separator = "-") {
    return String(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, separator)
      .replace(new RegExp(`${separator}+`, "g"), separator)
      .replace(new RegExp(`^${separator}|${separator}$`, "g"), "");
  }

  function convertCase(value, mode) {
    const words = value.trim().split(/\s+/).filter(Boolean);
    if (mode === "uppercase") return value.toUpperCase();
    if (mode === "lowercase") return value.toLowerCase();
    if (mode === "title") return words.map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase()).join(" ");
    if (mode === "sentence") return value.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
    if (mode === "camel") return words.map((word, index) => index === 0 ? word.toLowerCase() : word[0]?.toUpperCase() + word.slice(1).toLowerCase()).join("");
    if (mode === "snake") return words.map((word) => word.toLowerCase()).join("_");
    if (mode === "kebab") return words.map((word) => word.toLowerCase()).join("-");
    return value;
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const value = clean.length === 3 ? clean.split("").map((ch) => ch + ch).join("") : clean;
    return { r: parseInt(value.slice(0, 2), 16), g: parseInt(value.slice(2, 4), 16), b: parseInt(value.slice(4, 6), 16) };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0; let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0; let g = 0; let b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    const toHex = (value) => Math.round((value + m) * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
})();
