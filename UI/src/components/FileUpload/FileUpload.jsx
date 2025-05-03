import { useState, useRef, useEffect } from 'react';
import React from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    Tooltip,
    CircularProgress,
    Dialog,
    AppBar,
    Toolbar,
    Slide,
    useMediaQuery,
    useTheme,
    Tabs,
    Tab,
    Badge,
    Card,
    Grid,
    Chip,
    Stack,
    Snackbar,
    Alert
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { uploadPdfFile, getUserUploadedFiles } from '../../services/uploadService';
import { deletePdfFile } from '../../services/deleteService';
import './FileUpload.css';

// Transition cho Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


const FileUpload = ({ open, onClose, onFilesSelected }) => {
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [viewMode, setViewMode] = useState('list'); // Thay đổi giá trị mặc định từ 'grid' thành 'list'
    const fileInputRef = useRef(null);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
    const [currentPdfPath, setCurrentPdfPath] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [bookmarkedFiles, setBookmarkedFiles] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, fileToDelete: null });
    const [successAlert, setSuccessAlert] = useState({ open: false, message: '' });

    useEffect(() => {
        if (tabValue === 1) {
            loadUserFiles();
        }
    }, [tabValue]);

    useEffect(() => {
        // Tải danh sách bookmarked files từ localStorage khi component mount
        const loadBookmarkedFiles = () => {
            try {
                const savedBookmarks = localStorage.getItem('bookmarked_files');
                if (savedBookmarks) {
                    setBookmarkedFiles(JSON.parse(savedBookmarks));
                }
            } catch (error) {
                console.error('Lỗi khi tải bookmarked files:', error);
            }
        };

        loadBookmarkedFiles();
    }, []);

    const isFileBookmarked = (filePath) => {
        return bookmarkedFiles.includes(filePath);
    };

    const toggleBookmark = (filePath) => {
        let updatedBookmarks;

        if (isFileBookmarked(filePath)) {
            // Bỏ bookmark
            updatedBookmarks = bookmarkedFiles.filter(path => path !== filePath);
        } else {
            // Thêm bookmark
            updatedBookmarks = [...bookmarkedFiles, filePath];
        }

        // Cập nhật state
        setBookmarkedFiles(updatedBookmarks);

        // Lưu vào localStorage
        localStorage.setItem('bookmarked_files', JSON.stringify(updatedBookmarks));
    };

    const loadUserFiles = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('user_info'));
            const userId = userInfo?.id;
            if (!userId) return;
            const uploadedFiles = await getUserUploadedFiles(userId);
            setFiles(uploadedFiles);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách file:', error);
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        handleFiles(selectedFiles);
    };

    const handleFiles = (newFiles) => {
        if (newFiles.length === 0) return;
        const file = newFiles[0];

        // Kiểm tra nếu là file PDF
        const extension = file.name.split('.').pop().toLowerCase();
        if (extension !== 'pdf') {
            alert('Chỉ chấp nhận file PDF.');
            return;
        }

        // Kiểm tra file đã tồn tại chưa
        if (files.find(f => f.name === file.name)) {
            alert('File này đã được tải lên trước đó.');
            return;
        }

        // Thay vì upload ngay, chỉ lưu file đã chọn
        setSelectedFile(file);
    };

    const uploadSelectedFile = async () => {
        if (!selectedFile) {
            alert('Vui lòng chọn một file PDF để tải lên.');
            return;
        }

        setIsUploading(true);

        try {
            // Lấy userId từ localStorage
            const userInfo = JSON.parse(localStorage.getItem('user_info'));
            const userId = userInfo?.id;

            if (!userId) {
                throw new Error('Không tìm thấy thông tin người dùng.');
            }

            try {
                // Gọi API upload file                       
                await uploadPdfFile(selectedFile, userId);

                // Chuyển sang tab Tài liệu của tôi và tự động làm mới danh sách
                setTabValue(1);

                // Tải lại danh sách file từ Firestore
                await loadUserFiles();

                // Reset selectedFile sau khi upload thành công
                setSelectedFile(null);

                if (onFilesSelected) {
                    onFilesSelected(files);
                }
            } catch (error) {
                console.error(`Lỗi khi upload file ${selectedFile.name}:`, error);
                alert(`Không thể upload file ${selectedFile.name}.`);
            }
        } catch (error) {
            console.error('Lỗi trong quá trình upload:', error);
            alert('Có lỗi xảy ra trong quá trình upload.');
        } finally {
            setIsUploading(false);
        }
    };

    const openConfirmDialog = (fileToRemove) => {
        setConfirmDialog({
            open: true,
            fileToDelete: fileToRemove
        });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({
            open: false,
            fileToDelete: null
        });
    };

    const showSuccessAlert = (message) => {
        setSuccessAlert({
            open: true,
            message
        });

        // Auto close after 3 seconds
        setTimeout(() => {
            setSuccessAlert({
                open: false,
                message: ''
            });
        }, 3000);
    };

    const handleRemoveFile = async (fileToRemove) => {
        try {
            if (!fileToRemove.file_path) {
                alert('Không tìm thấy đường dẫn file để xóa.');
                return;
            }

            setIsDeleting(true);
            closeConfirmDialog();

            // Lấy userId từ localStorage
            const userInfo = JSON.parse(localStorage.getItem('user_info'));
            const userId = userInfo?.id;

            if (!userId) {
                throw new Error('Không tìm thấy thông tin người dùng.');
            }

            // Gọi API xóa file
            const result = await deletePdfFile(fileToRemove.file_path, userId);

            if (result.success) {
                // Cập nhật UI
                setFiles(files.filter(file => file.id !== fileToRemove.id));
                showSuccessAlert(`Đã xóa file ${fileToRemove.file_path.split('/').pop()} thành công!`);
            } else {
                alert(`Lỗi: ${result.message}`);
            }
        } catch (error) {
            console.error('Lỗi khi xóa file:', error);
            alert('Có lỗi xảy ra khi xóa file. Vui lòng thử lại sau.');
        } finally {
            setIsDeleting(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
    };

    const openFileDirectly = (filePath) => {
        if (!filePath) return;
        setCurrentPdfPath(filePath);
        setPdfViewerOpen(true);
    };

    return (
        <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: 'background.dark',
                    color: 'text.light',
                    borderRadius: '16px',
                    height: fullScreen ? '100%' : '80vh',
                    backgroundImage: 'radial-gradient(circle at 90% 5%, rgba(14, 165, 233, 0.05), transparent 25%), radial-gradient(circle at 10% 90%, rgba(99, 102, 241, 0.05), transparent 25%)',
                    backgroundSize: '100% 100%',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }
            }}
        >
            <AppBar position="static" elevation={0} sx={{
                bgcolor: 'background.dark',
                borderBottom: '1px solid',
                borderColor: 'divider',
                position: 'relative',
            }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachFileIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.light' }}>
                            Quản lý tài liệu
                        </Typography>
                    </Box>
                    <Tooltip title="Đóng">
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={onClose}
                            aria-label="close"
                            sx={{ color: 'text.light' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
                <Box sx={{ px: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'primary.main',
                            },
                            '& .MuiTab-root': {
                                color: 'text.secondary',
                                '&.Mui-selected': {
                                    color: 'primary.main',
                                },
                            },
                        }}
                    >
                        <Tab
                            label="Tải lên"
                            icon={<CloudUploadIcon fontSize="small" />}
                            iconPosition="start"
                        />
                        <Tab
                            label={
                                <Badge
                                    badgeContent={files.length}
                                    color="primary"
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            right: -12,
                                            top: -3,
                                        }
                                    }}
                                >
                                    <Box sx={{ pr: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <DescriptionIcon fontSize="small" />
                                        <span>Tài liệu của tôi</span>
                                    </Box>
                                </Badge>
                            }
                        />
                    </Tabs>
                </Box>
            </AppBar>

            <Box sx={{ p: 3, flexGrow: 1, overflow: 'auto' }}>
                {tabValue === 0 && (
                    <Paper
                        elevation={0}
                        className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        sx={{
                            bgcolor: 'background.darkLight',
                            borderColor: isDragging ? 'primary.main' : 'divider',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: isDragging ?
                                    'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, rgba(14, 165, 233, 0.02) 70%)' :
                                    'radial-gradient(circle, rgba(14, 165, 233, 0.04) 0%, transparent 70%)',
                                zIndex: 0,
                            }
                        }}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".pdf"
                            style={{ display: 'none' }}
                        />

                        {!selectedFile ? (
                            <>
                                <Box className="upload-icon-container">
                                    <CloudUploadIcon
                                        className="upload-icon"
                                        sx={{ color: 'primary.main' }}
                                    />
                                </Box>

                                <Typography variant="h6" className="upload-title" sx={{ color: 'text.light', position: 'relative', zIndex: 1 }}>
                                    Kéo & thả file PDF vào đây
                                </Typography>

                                <Typography variant="body2" className="upload-subtitle" sx={{ color: 'text.secondary', position: 'relative', zIndex: 1 }}>
                                    hoặc
                                </Typography>

                                <Button
                                    variant="contained"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="browse-button"
                                    disabled={isUploading}
                                    startIcon={<FileUploadIcon />}
                                    sx={{
                                        position: 'relative',
                                        zIndex: 1,
                                        background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #3b82f6 100%)',
                                    }}
                                >
                                    Chọn file
                                </Button>
                            </>
                        ) : (
                            <Box sx={{
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                position: 'relative',
                                zIndex: 1
                            }}>
                                <PictureAsPdfIcon sx={{ fontSize: 60, color: 'primary.main' }} />

                                <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.light', textAlign: 'center' }}>
                                    {selectedFile.name}
                                </Typography>

                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {formatFileSize(selectedFile.size)}
                                </Typography>

                                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => setSelectedFile(null)}
                                        startIcon={<DeleteIcon />}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Hủy
                                    </Button>

                                    <Button
                                        variant="contained"
                                        onClick={uploadSelectedFile}
                                        disabled={isUploading}
                                        startIcon={<CloudUploadIcon />}
                                        sx={{
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #3b82f6 100%)',
                                        }}
                                    >
                                        {isUploading ? 'Đang tải lên...' : 'Tải lên'}
                                    </Button>
                                </Stack>
                            </Box>
                        )}

                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            position: 'relative',
                            zIndex: 1,
                            color: 'text.secondary',
                            mt: 1
                        }}>
                            <InfoOutlinedIcon sx={{ fontSize: '1rem' }} />
                            <Typography variant="caption" className="file-limit-text" sx={{ color: 'text.secondary' }}>
                                Chỉ chấp nhận file PDF. Giới hạn 5MB mỗi file
                            </Typography>
                        </Box>

                        {files.length > 0 && (
                            <Box sx={{
                                position: 'absolute',
                                bottom: '10%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 1
                            }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setTabValue(1)}
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        borderRadius: 8,
                                        px: 2,
                                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                        backdropFilter: 'blur(8px)',
                                        borderColor: 'primary.main',
                                        '&:hover': {
                                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                                        }
                                    }}
                                >
                                    {`Xem ${files.length} tài liệu đã tải`}
                                </Button>
                            </Box>
                        )}
                    </Paper>
                )}

                {tabValue === 1 && (
                    <Box>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3,
                            flexWrap: 'wrap',
                            gap: 1
                        }}>
                            <Typography variant="body1" sx={{ color: 'text.light', fontWeight: 500 }}>
                                {files.length > 0 ? `${files.length} tài liệu` : 'Chưa có tài liệu nào'}
                            </Typography>

                            <Stack direction="row" spacing={1}>
                                {files.length > 0 && (
                                    <>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="primary"
                                            onClick={toggleViewMode}
                                            startIcon={viewMode === 'grid' ? <ViewListIcon /> : <GridViewIcon />}
                                            sx={{
                                                borderRadius: 2,
                                                borderColor: 'primary.main',
                                                color: 'primary.main',
                                                '&:hover': {
                                                    borderColor: 'primary.dark',
                                                    backgroundColor: 'rgba(14, 165, 233, 0.04)'
                                                }
                                            }}
                                        >
                                            {viewMode === 'grid' ? 'Dạng danh sách' : 'Dạng lưới'}
                                        </Button>

                                    </>
                                )}
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => setTabValue(0)}
                                    startIcon={<FileUploadIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #3b82f6 100%)',
                                    }}
                                >
                                    Tải lên
                                </Button>
                            </Stack>
                        </Box>

                        {files.length === 0 ? (
                            <Box sx={{
                                textAlign: 'center',
                                py: 8,
                                bgcolor: 'background.darkLight',
                                borderRadius: 2,
                                border: '1px dashed',
                                borderColor: 'divider'
                            }}>
                                <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                    Chưa có tài liệu nào được tải lên
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => setTabValue(0)}
                                    sx={{
                                        mt: 2,
                                        background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #3b82f6 100%)',
                                    }}
                                    startIcon={<FileUploadIcon />}
                                >
                                    Tải tài liệu lên ngay
                                </Button>
                            </Box>
                        ) : viewMode === 'grid' ? (
                            <Grid container spacing={2}>
                                {files.map((file, index) => (
                                    <Grid item xs={12} sm={6} md={4} key={file.id || index}>
                                        <Card
                                            elevation={1}
                                            sx={{
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                height: '100%',
                                                transition: 'all 0.3s ease',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                bgcolor: 'background.darkLight',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: '0 8px 16px rgba(14, 165, 233, 0.15)',
                                                    borderColor: 'primary.main',
                                                }
                                            }}
                                        >
                                            <Box sx={{
                                                p: 0,
                                                position: 'relative',
                                                borderBottom: '1px solid',
                                                borderColor: 'divider',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                height: '100%'
                                            }}>
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    py: 3,
                                                    bgcolor: 'rgba(14, 165, 233, 0.05)',
                                                }}>
                                                    <PictureAsPdfIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                                                </Box>

                                                <Box sx={{ p: 2, flexGrow: 1 }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 500,
                                                            color: 'text.light',
                                                            mb: 1,
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            lineHeight: '1.3em',
                                                            height: '2.6em'
                                                        }}
                                                    >
                                                        {file.file_path ? file.file_path.split('/').pop() : file.name || 'Document.pdf'}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: 'text.secondary',
                                                            display: 'block',
                                                            mb: 2
                                                        }}
                                                    >
                                                        {file.uploadedAt ?
                                                            new Date(
                                                                file.uploadedAt.seconds ?
                                                                    file.uploadedAt.seconds * 1000 :
                                                                    file.uploadedAt instanceof Date ?
                                                                        file.uploadedAt :
                                                                        Date.now()
                                                            ).toLocaleDateString('vi-VN', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }) :
                                                            'Vừa tải lên'
                                                        }
                                                    </Typography>
                                                </Box>

                                                <Box sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    borderTop: '1px solid',
                                                    borderColor: 'divider',
                                                    p: 1.5
                                                }}>
                                                    <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            sx={{
                                                                flexGrow: 1,
                                                                background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                                                                fontSize: '0.75rem',
                                                                '&:hover': {
                                                                    boxShadow: '0 4px 8px rgba(14, 165, 233, 0.25)'
                                                                }
                                                            }}
                                                            startIcon={<DescriptionIcon fontSize="small" />}
                                                            onClick={() => file.file_path ? openFileDirectly(file.file_path) : null}
                                                        >
                                                            Mở file
                                                        </Button>

                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            color="error"
                                                            sx={{
                                                                fontSize: '0.75rem',
                                                                minWidth: 'auto'
                                                            }}
                                                            startIcon={<DeleteIcon fontSize="small" />}
                                                            onClick={() => openConfirmDialog(file)}
                                                            disabled={isDeleting}
                                                        >
                                                            Xóa
                                                        </Button>
                                                    </Box>

                                                    <Tooltip title={isFileBookmarked(file.file_path) ? "Bỏ đánh dấu" : "Đánh dấu"}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => file.file_path && toggleBookmark(file.file_path)}
                                                            sx={{
                                                                ml: 1,
                                                                color: isFileBookmarked(file.file_path) ? 'warning.main' : 'text.secondary',
                                                                '&:hover': {
                                                                    color: isFileBookmarked(file.file_path) ? 'warning.dark' : 'primary.main'
                                                                }
                                                            }}
                                                        >
                                                            {isFileBookmarked(file.file_path) ?
                                                                <BookmarkIcon fontSize="small" /> :
                                                                <BookmarkBorderIcon fontSize="small" />
                                                            }
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <Paper
                                elevation={0}
                                className="file-list"
                                sx={{
                                    bgcolor: 'background.darkLight',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    overflow: 'hidden'
                                }}
                            >
                                <List sx={{ p: 0 }}>
                                    {files.map((file, index) => (
                                        <ListItem
                                            key={file.id || index}
                                            className="file-item"
                                            sx={{
                                                borderBottom: index < files.length - 1 ? '1px solid' : 'none',
                                                borderColor: 'divider',
                                                py: 1.5,
                                                '&:hover': {
                                                    bgcolor: 'rgba(14, 165, 233, 0.05)'
                                                }
                                            }}
                                        >
                                            <ListItemIcon>
                                                <PictureAsPdfIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body2" sx={{ color: 'text.light', fontWeight: 500 }}>
                                                        {file.file_path ? file.file_path.split('/').pop() : file.name || 'Document.pdf'}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {file.uploadedAt ?
                                                            new Date(
                                                                file.uploadedAt.seconds ?
                                                                    file.uploadedAt.seconds * 1000 :
                                                                    file.uploadedAt instanceof Date ?
                                                                        file.uploadedAt :
                                                                        Date.now()
                                                            ).toLocaleDateString('vi-VN') :
                                                            'Vừa tải lên'
                                                        }
                                                    </Typography>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Chip
                                                        label="PDF"
                                                        size="small"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '0.625rem',
                                                            bgcolor: 'primary.main',
                                                            color: 'white',
                                                            fontWeight: 600
                                                        }}
                                                    />
                                                    <Tooltip title="Xem file">
                                                        <IconButton
                                                            onClick={() => file.file_path ? openFileDirectly(file.file_path) : null}
                                                            size="small"
                                                            sx={{ color: 'primary.main' }}
                                                        >
                                                            <DescriptionIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Xóa file">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => openConfirmDialog(file)}
                                                            disabled={isDeleting}
                                                            sx={{ color: 'error.main' }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title={isFileBookmarked(file.file_path) ? "Bỏ đánh dấu" : "Đánh dấu"}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => file.file_path && toggleBookmark(file.file_path)}
                                                            sx={{
                                                                color: isFileBookmarked(file.file_path) ? 'warning.main' : 'text.secondary',
                                                                '&:hover': {
                                                                    color: isFileBookmarked(file.file_path) ? 'warning.dark' : 'primary.main'
                                                                }
                                                            }}
                                                        >
                                                            {isFileBookmarked(file.file_path) ?
                                                                <BookmarkIcon fontSize="small" /> :
                                                                <BookmarkBorderIcon fontSize="small" />
                                                            }
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        )}
                    </Box>
                )}
            </Box>

            {(isUploading || isDeleting) && (
                <Box sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'rgba(15, 23, 42, 0.9)',
                    px: 3,
                    py: 2,
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(15, 23, 42, 0.3)',
                    zIndex: 5,
                    gap: 2,
                    backdropFilter: 'blur(8px)'
                }}>
                    <CircularProgress size={24} sx={{ color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ color: 'text.light' }}>
                        {isUploading ? 'Đang tải file lên...' : 'Đang xóa file...'}
                    </Typography>
                </Box>
            )}

            {/* Thêm PDF Viewer Dialog */}
            <Dialog
                open={pdfViewerOpen}
                onClose={() => setPdfViewerOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        height: '90vh',
                        maxHeight: '90vh',
                        bgcolor: 'background.dark',
                        color: 'text.light',
                    }
                }}
            >
                <AppBar position="static" elevation={0} sx={{
                    bgcolor: 'background.dark',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}>
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.light' }}>
                            {currentPdfPath.split('/').pop()}
                        </Typography>
                        <IconButton
                            color="inherit"
                            onClick={() => setPdfViewerOpen(false)}
                            sx={{ color: 'text.light' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Box sx={{ height: 'calc(100% - 64px)', bgcolor: 'rgba(0,0,0,0.7)' }}>
                    <iframe
                        src={`http://localhost:8000/pdf/${currentPdfPath}`}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                        }}
                        title="PDF Viewer"
                    />
                </Box>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={closeConfirmDialog}
                PaperProps={{
                    sx: {
                        bgcolor: 'background.dark',
                        color: 'text.light',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '400px',
                    }
                }}
            >
                <Box sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.light', fontWeight: 600 }}>
                        Xác nhận xóa file
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                        Bạn có chắc chắn muốn xóa file{' '}
                        <span style={{ color: '#0ea5e9', fontWeight: 500 }}>
                            {confirmDialog.fileToDelete?.file_path ? confirmDialog.fileToDelete.file_path.split('/').pop() : ''}
                        </span>
                        ? Thao tác này không thể hoàn tác.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={closeConfirmDialog}
                            sx={{
                                borderRadius: 2,
                                borderColor: 'divider',
                                color: 'text.secondary',
                                '&:hover': {
                                    borderColor: 'divider',
                                    bgcolor: 'rgba(255, 255, 255, 0.05)'
                                }
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => confirmDialog.fileToDelete && handleRemoveFile(confirmDialog.fileToDelete)}
                            startIcon={<DeleteIcon />}
                            sx={{ borderRadius: 2 }}
                        >
                            Xóa file
                        </Button>
                    </Box>
                </Box>
            </Dialog>

            {/* Success Alert */}
            <Snackbar
                open={successAlert.open}
                autoHideDuration={3000}
                onClose={() => setSuccessAlert({ open: false, message: '' })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    sx={{
                        width: '100%',
                        bgcolor: 'rgba(16, 185, 129, 0.9)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                            color: 'white'
                        }
                    }}
                >
                    {successAlert.message}
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

export default FileUpload;