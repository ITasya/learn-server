import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_req, file, cb) => {
    // Preserve original name but make it unique
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  },
});

const imageFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = ['.jpg', '.jpeg', '.webp', '.png', '.svg'];
  if (!allowed.includes(ext)) {
    return cb(new Error(`Unsupported image type: ${ext}`), false);
  }
  cb(null, true);
};

const lectureFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedVideo = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  const allowedMaterial = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.webp'];

  if ([...allowedVideo, ...allowedMaterial].includes(ext)) {
    return cb(null, true);
  }
  cb(new Error(`Unsupported file type: ${ext}`), false);
};

/**
 * For avatar/thumbnail uploads (images only)
 */
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: imageFilter,
});

/**
 * For lecture uploads: video + optional material files.
 * Fields: lecture (1 video), materialFiles (up to 10 files).
 */
const uploadLecture = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: lectureFilter,
}).fields([
  { name: 'lecture', maxCount: 1 },
  { name: 'materialFiles', maxCount: 10 },
]);

export { uploadLecture };
export default upload;
