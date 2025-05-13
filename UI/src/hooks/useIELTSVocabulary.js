import { useState, useCallback } from 'react';
import { queryIELTSVocabulary } from '../services/webScraperService';

/**
 * Custom hook để quản lý chức năng 
 * @returns {Object} Các state và function để quản lý 
 */
export const useIELTSVocabulary = () => {
  const [isIELTSMode, setIsIELTSMode] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  /**
   * Gửi câu hỏi về IELTS vocabulary
   * @param {string} query - Câu hỏi của người dùng
   * @returns {Promise<string>} Phản hồi từ API
   */
  const sendIELTSQuery = async (query) => {
    try {
      const response = await queryIELTSVocabulary(query, showUrlInput ? customUrl : null);
      return response.response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Bật/tắt chế độ IELTS Vocabulary
   */
  const toggleIELTSMode = useCallback(() => {
    setIsIELTSMode(prev => !prev);
    if (!isIELTSMode) {
      setCustomUrl('');
      setShowUrlInput(false);
    }
  }, [isIELTSMode]);

  /**
   * Bật/tắt input URL
   */
  const toggleUrlInput = useCallback(() => {
    setShowUrlInput(prev => !prev);
    if (!showUrlInput) {
      setCustomUrl('');
    }
  }, [showUrlInput]);

  /**
   * Cập nhật URL tùy chỉnh
   * @param {string} url - URL mới
   */
  const updateCustomUrl = useCallback((url) => {
    setCustomUrl(url);
  }, []);

  return {
    isIELTSMode,
    customUrl,
    showUrlInput,
    sendIELTSQuery,
    toggleIELTSMode,
    toggleUrlInput,
    updateCustomUrl
  };
}; 