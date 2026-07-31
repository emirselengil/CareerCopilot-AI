"""Merkezi Türkçe hata/uyarı mesajları.

Tüm kullanıcıya dönük mesajlar buradan referans alınır (TASK-109).
"""

# Auth
MSG_EMAIL_ALREADY_REGISTERED = "Bu e-posta adresi zaten kayıtlı."
MSG_PASSWORD_TOO_SHORT = "Şifre en az 8 karakter olmalıdır."
MSG_INVALID_CREDENTIALS = "E-posta veya şifre hatalı."
MSG_INVALID_TOKEN = "Token geçersiz veya süresi dolmuş."
MSG_TOKEN_MISSING = "Kimlik doğrulama gerekli."
MSG_REFRESH_TOKEN_INVALID = "Refresh token geçersiz veya süresi dolmuş."
MSG_USER_NOT_FOUND = "Kullanıcı bulunamadı."
MSG_RATE_LIMITED_LOGIN = "Çok fazla giriş denemesi yaptınız. Lütfen bir dakika sonra tekrar deneyin."

# Genel
MSG_FORBIDDEN = "Bu kaynağa erişim yetkiniz yok."
MSG_NOT_FOUND = "Kayıt bulunamadı."
MSG_VALIDATION_ERROR = "Gönderilen veriler geçersiz."
MSG_INTERNAL_ERROR = "Beklenmeyen bir sunucu hatası oluştu."
MSG_LLM_BUSY = "Sunucu şu anda yoğun, lütfen tekrar deneyin."
MSG_LLM_ERROR = "Yapay zeka servisiyle iletişim kurulamadı, lütfen tekrar deneyin."

# Documents
MSG_FILE_TOO_LARGE = "Dosya boyutu 5 MB'ı aşamaz."
MSG_UNSUPPORTED_FILE_TYPE = "Yalnızca PDF ve DOCX dosyaları desteklenir."
MSG_FILE_CONTENT_MISMATCH = (
    "Dosya içeriği beklenen dosya türüyle uyuşmuyor. Lütfen geçerli bir PDF veya DOCX dosyası yükleyin."
)
MSG_INVALID_DOCUMENT_TYPE = "document_type alanı 'cv' veya 'linkedin_pdf' olmalıdır."
MSG_DOCUMENT_NOT_FOUND = "Belge bulunamadı."
MSG_NO_DOCUMENTS_FOR_ANALYSIS = "Analiz için önce bir CV yüklemeli veya oluşturmalısınız."
MSG_DOCUMENT_FILE_MISSING = "Belge dosyası işlenirken bulunamadı, lütfen belgeyi tekrar yükleyin."

# CV
MSG_CV_NAME_EMAIL_REQUIRED = "Ad-soyad ve e-posta zorunludur."
MSG_CV_SECTIONS_REQUIRED = "En az bir CV bölümü seçmelisiniz."
MSG_CV_INVALID_OUTPUT_LANGUAGE = "output_language alanı 'tr', 'en' veya 'both' olmalıdır."
MSG_CV_DRAFT_NOT_FOUND = "CV taslağı bulunamadı."
MSG_CV_NOT_GENERATED_YET = "Önce CV metnini üretin."
MSG_CV_INVALID_EXPORT_LANGUAGE = "language alanı 'tr' veya 'en' olmalıdır."

# Skill Gap / Roadmap
MSG_SKILL_GAP_NOT_FOUND = "Beceri boşluğu raporu bulunamadı."
MSG_ROADMAP_NOT_FOUND = "Yol haritası bulunamadı."
MSG_TARGET_POSITION_REQUIRED = "Hedef pozisyon boş olamaz."
MSG_WEEKLY_HOURS_INVALID = "weekly_hours alanı 1-40 aralığında olmalıdır."
MSG_TASK_NOT_FOUND_IN_ROADMAP = "Belirtilen görev yol haritasında bulunamadı."

# Interview
MSG_INTERVIEW_SESSION_NOT_FOUND = "Mülakat oturumu bulunamadı."
MSG_INTERVIEW_SESSION_ALREADY_ENDED = "Bu mülakat oturumu zaten bitmiş."
MSG_INTERVIEW_ANSWER_REQUIRED = "Cevap alanı boş olamaz."
MSG_INTERVIEW_QUESTION_INDEX_MISMATCH = "question_index mevcut soruyla uyuşmuyor."
MSG_INTERVIEW_INVALID_DIFFICULTY = "difficulty alanı 'junior' veya 'mid' olmalıdır."
MSG_INTERVIEW_INVALID_CATEGORY = "category alanı 'algorithmic', 'system' veya 'behavioral' olmalıdır."

# GitHub
MSG_GITHUB_USER_NOT_FOUND = "Belirtilen GitHub kullanıcısı bulunamadı."
MSG_GITHUB_INVALID_USERNAME = "GitHub kullanıcı adı formatı geçersiz."
MSG_GITHUB_NOT_CONNECTED = "Önce GitHub hesabınızı bağlamalısınız."
MSG_GITHUB_API_ERROR = "GitHub servisine ulaşılamadı, lütfen tekrar deneyin."

# Tasks
MSG_TASK_NOT_FOUND = "İş kaydı bulunamadı."

# Profile
MSG_PROFILE_NOT_FOUND = "Profil bulunamadı."
