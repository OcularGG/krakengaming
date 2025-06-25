'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import FileUpload from '../../components/FileUpload';

// Lazy Image Component
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, onError }) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <div ref={imgRef} className={`${className} relative`}>
      {isLoading && imageSrc && (
        <div className="absolute inset-0 bg-navy-dark/10 animate-pulse flex items-center justify-center">
          <div className="text-navy-dark">⚓</div>
        </div>
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={className}
          onLoad={() => setIsLoading(false)}
          onError={onError}
        />
      )}
      {!imageSrc && (
        <div className={`${className} bg-navy-dark/5 flex items-center justify-center`}>
          <div className="text-navy-dark/50">Loading...</div>
        </div>
      )}
    </div>
  );
};

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description: string;
  uploader: string;
  uploaderId: string;
  createdAt: string;
  // New fields for enhanced features
  upvotes: number;
  downvotes: number;
  viewCount: number;
  tags: string[];
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  originalFileName?: string;
  mimeType?: string;
}

interface GalleryResponse {
  items: GalleryItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    search: string;
    sortBy: string;
    sortOrder: string;
  };
}

// Helper function to safely parse API responses
const safeApiCall = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const text = await response.text();
  if (!text) {
    throw new Error('Empty response from server');
  }

  return JSON.parse(text);
};

export default function GalleryPage() {
  const { data: session } = useSession();
  const [galleryData, setGalleryData] = useState<GalleryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{item: GalleryItem, type: 'image' | 'video'} | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [itemsPerPage] = useState(12);
  const [dateFilter, setDateFilter] = useState('');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  // New state for enhanced features
  const [userVotes, setUserVotes] = useState<{[itemId: string]: 'upvote' | 'downvote' | undefined}>({});
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [itemComments, setItemComments] = useState<{[itemId: string]: any[]}>({});
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState<{[itemId: string]: boolean}>({});

  const [uploadForm, setUploadForm] = useState({
    type: 'image' as 'image' | 'video',
    url: '',
    title: '',
    description: '',
    tags: '' as string,
    uploadMethod: 'url' as 'url' | 'file'
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{[fileName: string]: number}>({});

  const fetchGalleryItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
        search: searchTerm
      });

      // Add date filtering parameters
      if (dateFilter) {
        params.append('dateFilter', dateFilter);
      }
      if (dateRangeEnd) {
        params.append('dateRangeEnd', dateRangeEnd);
      }

      const response = await fetch(`/api/gallery?${params}`);

      const data = await safeApiCall(response);
      setGalleryData(data);
    } catch (error) {
      console.error('Failed to fetch gallery items:', error);
      // Set empty data structure to prevent further errors
      setGalleryData({
        items: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 12,
          hasNextPage: false,
          hasPrevPage: false
        },
        filters: {
          search: '',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, sortBy, sortOrder, searchTerm, dateFilter, dateRangeEnd]);

  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  // Real-time search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
      if (searchTerm.trim()) {
        saveToSearchHistory(searchTerm); // Save to search history
      }
      fetchGalleryItems();
    }, 300); // 300ms delay for real-time search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchHistory(false);
    // Search is now handled by the useEffect above
  };

  const selectFromSearchHistory = (term: string) => {
    setSearchTerm(term);
    setShowSearchHistory(false);
  };

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setUploadLoading(true);

    try {
      let response;

      if (uploadForm.uploadMethod === 'file' && selectedFiles) {
        // File upload
        const formData = new FormData();

        // Add all selected files
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append('files', selectedFiles[i]);
        }

        // Add metadata
        formData.append('title', uploadForm.title);
        formData.append('description', uploadForm.description);
        formData.append('tags', uploadForm.tags);
        formData.append('uploaderName', session.user?.name || 'Anonymous Captain');
        formData.append('uploaderId', session.user?.discordId || 'unknown');

        response = await fetch('/api/gallery/upload', {
          method: 'POST',
          body: formData
        });
      } else {
        // URL upload (existing functionality)
        const uploadData = {
          ...uploadForm,
          uploaderName: session.user?.name || 'Anonymous Captain',
          uploaderId: session.user?.discordId || 'unknown'
        };

        response = await fetch('/api/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        });
      }

      const result = await response.json();

      if (response.ok) {
        alert(uploadForm.uploadMethod === 'file'
          ? `Successfully uploaded ${result.items?.length || 1} file(s)!`
          : 'Successfully added to gallery!'
        );
        setUploadForm({ type: 'image', url: '', title: '', description: '', tags: '', uploadMethod: 'url' });
        setSelectedFiles(null);
        setUploadProgress({});
        setShowUploadForm(false);
        fetchGalleryItems(); // Refresh the gallery
      } else {
        alert(result.error || 'Upload failed');
        console.error('Upload failed:', result);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFilesSelected = (files: FileList) => {
    setSelectedFiles(files);
    setUploadForm(prev => ({ ...prev, uploadMethod: 'file' }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const navigateModal = (direction: 'prev' | 'next') => {
    if (!selectedMedia || !galleryData) return;

    const currentIndex = galleryData.items.findIndex(item => item.id === selectedMedia.item.id);
    let newIndex;

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : galleryData.items.length - 1;
    } else {
      newIndex = currentIndex < galleryData.items.length - 1 ? currentIndex + 1 : 0;
    }

    const newItem = galleryData.items[newIndex];
    setSelectedMedia({ item: newItem, type: newItem.type });
  };

  const handleDelete = async (itemId: string) => {
    if (!session) return;

    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/gallery?id=${itemId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSelectedMedia(null);
          fetchGalleryItems(); // Refresh the gallery
        } else {
          console.error('Delete failed');
          alert('Failed to delete item');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete item');
      }
    }
  };

  // Enhanced feature functions
  const handleVote = async (itemId: string, voteType: 'upvote' | 'downvote') => {
    if (!session?.user) return;

    // Optimistic update
    const currentVote = userVotes[itemId];
    const newVote = currentVote === voteType ? undefined : voteType;

    // Update local state immediately
    setUserVotes(prev => ({
      ...prev,
      [itemId]: newVote
    }));

    // Optimistically update vote counts
    setGalleryData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(item => {
          if (item.id !== itemId) return item;

          let newUpvotes = item.upvotes;
          let newDownvotes = item.downvotes;

          // Remove previous vote effect
          if (currentVote === 'upvote') newUpvotes--;
          if (currentVote === 'downvote') newDownvotes--;

          // Add new vote effect
          if (newVote === 'upvote') newUpvotes++;
          if (newVote === 'downvote') newDownvotes++;

          return {
            ...item,
            upvotes: Math.max(0, newUpvotes),
            downvotes: Math.max(0, newDownvotes)
          };
        })
      };
    });

    try {
      const response = await fetch('/api/gallery?feature=vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryItemId: itemId,
          userId: session.user.id || 'dev-user',
          voteType
        })
      });

      const result = await safeApiCall(response);
      if (!result.success) {
        // Revert optimistic update on failure
        setUserVotes(prev => ({
          ...prev,
          [itemId]: currentVote
        }));
        // Refresh to get correct data
        fetchGalleryItems();
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      // Revert optimistic update on error
      setUserVotes(prev => ({
        ...prev,
        [itemId]: currentVote
      }));
      // Refresh to get correct data
      fetchGalleryItems();
    }
  };

  const handleFavorite = async (itemId: string) => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/gallery?feature=favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryItemId: itemId,
          userId: session.user.id || 'dev-user'
        })
      });

      const result = await safeApiCall(response);
      if (result.success) {
        setUserFavorites(prev => {
          const newFavorites = new Set(prev);
          if (result.isFavorited) {
            newFavorites.add(itemId);
          } else {
            newFavorites.delete(itemId);
          }
          return newFavorites;
        });
      }
    } catch (error) {
      console.error('Failed to favorite:', error);
    }
  };

  const handleComment = async (itemId: string, content: string) => {
    if (!session?.user || !content.trim()) return;

    try {
      const response = await fetch('/api/gallery?feature=comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          galleryItemId: itemId,
          userId: session.user.id || 'dev-user',
          userName: session.user.name || 'Anonymous Captain',
          content: content.trim()
        })
      });

      const result = await safeApiCall(response);
      if (result.success) {
        setItemComments(prev => ({
          ...prev,
          [itemId]: [...(prev[itemId] || []), result.comment]
        }));
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to comment:', error);
    }
  };

  const loadComments = async (itemId: string) => {
    try {
      const response = await fetch(`/api/gallery?feature=comments&galleryItemId=${itemId}`);
      const result = await safeApiCall(response);
      setItemComments(prev => ({
        ...prev,
        [itemId]: result.comments || []
      }));
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const saveToSearchHistory = async (searchTerm: string) => {
    if (!session?.user || !searchTerm.trim()) return;

    try {
      await fetch('/api/gallery?feature=search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id || 'dev-user',
          searchTerm: searchTerm.trim()
        })
      });
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  const loadSearchHistory = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/gallery?feature=search-history&userId=${session.user.id || 'dev-user'}`);
      const result = await safeApiCall(response);
      setSearchHistory(result.searchHistory?.map((item: any) => item.searchTerm) || []);
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const copyShareLink = async (itemId: string) => {
    try {
      const shareUrl = `${window.location.origin}/gallery?share=${itemId}`;
      await navigator.clipboard.writeText(shareUrl);
      // Simple success feedback without popup
      const button = document.querySelector(`[data-share="${itemId}"]`) as HTMLElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.style.backgroundColor = '#10b981';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '';
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // Load user's votes and favorites on mount
  useEffect(() => {
    if (session?.user && galleryData?.items) {
      // Load votes and favorites for visible items
      galleryData.items.forEach(async (item) => {
        try {
          const voteResponse = await fetch(`/api/gallery?feature=votes&galleryItemId=${item.id}&userId=${session.user.id || 'dev-user'}`);
          const voteResult = await voteResponse.json();
          if (voteResult.vote) {
            setUserVotes(prev => ({
              ...prev,
              [item.id]: voteResult.vote.voteType
            }));
          }

          const favoriteResponse = await fetch(`/api/gallery?feature=favorites&galleryItemId=${item.id}&userId=${session.user.id || 'dev-user'}`);
          const favoriteResult = await favoriteResponse.json();
          if (favoriteResult.isFavorited) {
            setUserFavorites(prev => new Set([...prev, item.id]));
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
        }
      });
    }
  }, [session, galleryData]);

  // Load search history when search input is focused
  useEffect(() => {
    if (showSearchHistory && session?.user) {
      loadSearchHistory();
    }
  }, [showSearchHistory, session]);

  const renderModal = () => {
    if (!selectedMedia) return null;

    const { item, type } = selectedMedia;
    const canDelete = session && (session.user.discordId === item.uploaderId || session.user.name === 'admin');

    return (
      <div className="fixed inset-0 bg-navy-dark/90 z-50 flex items-center justify-center p-4 modal-backdrop">
        {/* Navigation Arrows - On the sides */}
        <button
          onClick={() => navigateModal('prev')}
          className="fixed left-8 top-1/2 -translate-y-1/2 z-[60] neo-brutal-button bg-brass text-navy-dark w-14 h-14 flex items-center justify-center text-2xl shadow-lg"
          title="Previous image"
        >
          ←
        </button>
        <button
          onClick={() => navigateModal('next')}
          className="fixed right-8 top-1/2 -translate-y-1/2 z-[60] neo-brutal-button bg-brass text-navy-dark w-14 h-14 flex items-center justify-center text-2xl shadow-lg"
          title="Next image"
        >
          →
        </button>

        <div className="neo-brutal-box bg-sail-white max-w-6xl w-full max-h-[90vh] flex flex-col relative">
          <div className="p-4 border-b-4 border-navy-dark flex justify-between items-center flex-shrink-0">
            <h3 className="text-xl font-bold text-navy-dark" style={{fontFamily: 'Cinzel, serif'}}>
              {item.title}
            </h3>
            <div className="flex gap-2">
              {/* Share Button */}
              <button
                onClick={() => copyShareLink(item.id)}
                className="neo-brutal-button bg-brass text-navy-dark px-4 py-2"
                title="Share this image"
                data-share={item.id}
              >
                Share
              </button>

              {canDelete && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className="neo-brutal-button bg-blood-red text-sail-white px-4 py-2"
                  title="Delete this item"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedMedia(null);
                }}
                className="neo-brutal-button bg-cannon-smoke text-sail-white px-4 py-2"
              >
                Close
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {type === 'video' ? (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(item.url)}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : (
              <div className="p-4">
                {/* Image Container */}
                <div className="flex justify-center items-center mb-4">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="max-w-full max-h-[50vh] object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Content section - Always visible and scrollable */}
            <div className="p-4 bg-sandstone-100 border-t-2 border-navy-dark">
              <p className="text-navy-dark mb-4" style={{fontFamily: 'Crimson Text, serif'}}>
                {item.description}
              </p>

              {/* Tags in Modal */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-brass/20 text-navy-dark text-xs border border-brass/40"
                      style={{fontFamily: 'Crimson Text, serif'}}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats in Modal */}
              <div className="flex justify-between items-center text-sm mb-4">
                <div className="flex gap-4">
                  <span>▲ {item.upvotes} upvotes</span>
                  <span>▼ {item.downvotes} downvotes</span>
                  <span>{item.viewCount} views</span>
                </div>
                <div className="text-brass">
                  <span>Captain {item.uploader} • {formatDate(item.createdAt)}</span>
                </div>
              </div>

              {/* Comments Section */}
              {session?.user && (
                <div className="border-t border-navy-dark/10 pt-4">
                  <h4 className="font-semibold text-navy-dark mb-2">Comments</h4>

                  {/* Existing Comments */}
                  {(itemComments[item.id] || []).map((comment, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded mb-2 text-sm">
                      <div className="font-semibold text-navy-dark">{comment.userName}</div>
                      <div className="text-gray-700">{comment.content}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}

                  {/* Add Comment */}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 text-sm p-3 border-2 border-navy-dark"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newComment.trim()) {
                          handleComment(item.id, newComment);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newComment.trim()) {
                          handleComment(item.id, newComment);
                        }
                      }}
                      className="neo-brutal-button bg-brass text-navy-dark px-4 py-3"
                      disabled={!newComment.trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (!galleryData || galleryData.pagination.totalPages <= 1) return null;

    const { pagination } = galleryData;
    const pages = [];

    // Calculate page range to show
    const maxPagesToShow = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Previous button
    if (pagination.hasPrevPage) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          className="neo-brutal-button bg-brass text-navy-dark px-3 py-2 mr-2"
        >
          ← Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`neo-brutal-button px-3 py-2 mr-2 ${
            i === pagination.currentPage
              ? 'bg-brass-bright text-navy-dark'
              : 'bg-sail-white text-navy-dark'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (pagination.hasNextPage) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          className="neo-brutal-button bg-brass text-navy-dark px-3 py-2"
        >
          Next →
        </button>
      );
    }

    return (
      <div className="flex flex-col md:flex-row justify-center items-center mt-12 mb-8 gap-4">
        <div className="flex items-center flex-wrap justify-center">
          {pages}
        </div>
        <div className="text-navy-dark text-center" style={{fontFamily: 'Crimson Text, serif'}}>
          {pagination.totalItems} total items • Page {pagination.currentPage} of {pagination.totalPages}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-sandstone-light pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-navy-dark mb-8" style={{fontFamily: 'Cinzel, serif'}}>
            <span className="text-brass">Gallery</span>
          </h1>
          <p className="text-xl text-navy-dark/80 max-w-3xl mx-auto" style={{fontFamily: 'Crimson Text, serif'}}>
            Chronicles of our greatest naval victories and legendary battles
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="neo-brutal-box p-6 mb-8">
          <div className="flex flex-col gap-6">
            {/* Search and Sort Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Form */}
              <div className="flex-1 relative w-full md:w-auto">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setShowSearchHistory(true)}
                      onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                      placeholder="Search by title, captain, or tags..."
                      className="w-full p-3 border-2 border-navy-dark text-navy-dark"
                      style={{fontFamily: 'Crimson Text, serif'}}
                    />
                    {/* Search History Dropdown */}
                    {showSearchHistory && searchHistory.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-sail-white border-2 border-navy-dark border-t-0 z-10 max-h-40 overflow-y-auto">
                        {searchHistory.map((term, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectFromSearchHistory(term)}
                            className="w-full text-left p-2 hover:bg-brass/20 border-b border-navy-dark/10 last:border-b-0"
                            style={{fontFamily: 'Crimson Text, serif'}}
                          >
                            🕐 {term}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="neo-brutal-button bg-brass text-navy-dark px-6 py-3"
                  >
                    Search
                  </button>
                </form>
              </div>

              {/* Sort Controls */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleSortChange('createdAt')}
                  className={`neo-brutal-button px-4 py-3 ${
                    sortBy === 'createdAt' ? 'bg-brass-bright text-navy-dark' : 'bg-sail-white text-navy-dark'
                  }`}
                >
                  Date {sortBy === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
                <button
                  onClick={() => handleSortChange('title')}
                  className={`neo-brutal-button px-4 py-3 ${
                    sortBy === 'title' ? 'bg-brass-bright text-navy-dark' : 'bg-sail-white text-navy-dark'
                  }`}
                >
                  Title {sortBy === 'title' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
                <button
                  onClick={() => handleSortChange('uploader')}
                  className={`neo-brutal-button px-4 py-3 ${
                    sortBy === 'uploader' ? 'bg-brass-bright text-navy-dark' : 'bg-sail-white text-navy-dark'
                  }`}
                >
                  Captain {sortBy === 'uploader' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
                <button
                  onClick={() => handleSortChange('upvotes')}
                  className={`neo-brutal-button px-4 py-3 ${
                    sortBy === 'upvotes' ? 'bg-brass-bright text-navy-dark' : 'bg-sail-white text-navy-dark'
                  }`}
                >
                  Popular {sortBy === 'upvotes' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
                <button
                  onClick={() => handleSortChange('viewCount')}
                  className={`neo-brutal-button px-4 py-3 ${
                    sortBy === 'viewCount' ? 'bg-brass-bright text-navy-dark' : 'bg-sail-white text-navy-dark'
                  }`}
                >
                  Most Viewed {sortBy === 'viewCount' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
              </div>
            </div>

            {/* Date Filter Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center border-t border-navy-dark/20 pt-4">
              <label className="text-navy-dark font-semibold" style={{fontFamily: 'Cinzel, serif'}}>
                Filter by Date:
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="p-2 border-2 border-navy-dark text-navy-dark"
                  placeholder="Exact date"
                />
                <span className="flex items-center text-navy-dark px-2">to</span>
                <input
                  type="date"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  className="p-2 border-2 border-navy-dark text-navy-dark"
                  placeholder="End date"
                />
                <button
                  onClick={() => {
                    setDateFilter('');
                    setDateRangeEnd('');
                    setCurrentPage(1);
                  }}
                  className="neo-brutal-button bg-cannon-smoke text-sail-white px-4 py-2"
                >
                  Clear Dates
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        {galleryData && galleryData.items.length > 0 && (
          <div className="mb-12">
            <div className="neo-brutal-box p-6">
              <h2 className="text-2xl font-bold text-navy-dark mb-6" style={{fontFamily: 'Cinzel, serif'}}>
                Recent Activity
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {galleryData.items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border-2 border-navy-dark p-3 cursor-pointer hover:bg-brass/10 transition-colors"
                    onClick={() => {
                      setSelectedMedia({item, type: item.type});
                    }}
                  >
                    <div className="relative aspect-video mb-2 bg-navy-dark/10">
                      <LazyImage
                        src={item.thumbnail || item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg';
                        }}
                      />
                      {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-navy-dark/40">
                          <div className="bg-brass/90 rounded-full p-2">
                            <svg className="w-4 h-4 text-navy-dark ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-navy-dark text-sm mb-1 line-clamp-2" style={{fontFamily: 'Cinzel, serif'}}>
                      {item.title}
                    </h4>
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span>▲ {item.upvotes}</span>
                      <span>{item.viewCount} views</span>
                    </div>
                    <div className="text-xs text-brass mt-1">
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload Section - Only shown if logged in */}
        {session && (
          <div className="mb-12">
            {!showUploadForm ? (
              <div className="text-center">
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="neo-brutal-button bg-brass text-navy-dark px-8 py-4 text-lg"
                >
                  Add to the Gallery
                </button>
              </div>
            ) : (
              <div className="neo-brutal-box max-w-2xl mx-auto p-8">
                <h2 className="text-2xl font-bold text-navy-dark mb-6 text-center" style={{fontFamily: 'Cinzel, serif'}}>
                  Add to the Kraken Gallery
                </h2>
                <form onSubmit={handleUpload} className="space-y-6">
                  {/* Upload Method Selection */}
                  <div>
                    <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                      Upload Method
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setUploadForm({...uploadForm, uploadMethod: 'url'})}
                        className={`neo-brutal-button px-4 py-2 ${
                          uploadForm.uploadMethod === 'url'
                            ? 'bg-brass text-navy-dark'
                            : 'bg-sail-white text-navy-dark'
                        }`}
                      >
                        From URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadForm({...uploadForm, uploadMethod: 'file'})}
                        className={`neo-brutal-button px-4 py-2 ${
                          uploadForm.uploadMethod === 'file'
                            ? 'bg-brass text-navy-dark'
                            : 'bg-sail-white text-navy-dark'
                        }`}
                      >
                        Upload Files
                      </button>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  {uploadForm.uploadMethod === 'file' ? (
                    <div>
                      <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                        Upload Image
                      </label>
                      <FileUpload
                        onFilesSelected={handleFilesSelected}
                        maxFiles={5}
                        acceptedTypes={['image/*', 'video/*']}
                        disabled={uploadLoading}
                      />

                      {/* Selected Files Display */}
                      {selectedFiles && selectedFiles.length > 0 && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-green-800 font-semibold mb-2">Selected Files:</p>
                          {Array.from(selectedFiles).map((file, index) => (
                            <div key={index} className="flex justify-between items-center text-sm py-1">
                              <span className="text-green-700">{file.name}</span>
                              <span className="text-green-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* URL Input Section */
                    <div>
                      <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                        Media URL
                      </label>
                      <input
                        type="url"
                        value={uploadForm.url}
                        onChange={(e) => setUploadForm({...uploadForm, url: e.target.value})}
                        className="w-full p-3 border-2 border-navy-dark text-navy-dark"
                        placeholder="https://example.com/image.jpg or https://youtube.com/watch?v=..."
                        required={uploadForm.uploadMethod === 'url'}
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                      Title
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                      className="w-full p-3 border-2 border-navy-dark text-navy-dark"
                      placeholder="e.g., Battle of Trafalgar"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                      Description
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                      className="w-full p-3 border-2 border-navy-dark text-navy-dark h-24"
                      placeholder="Describe what this image or video is about"
                    />
                  </div>

                  <div>
                    <label className="block text-navy-dark font-semibold mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                      Tags (up to 5, separated by commas)
                    </label>
                    <input
                      type="text"
                      value={uploadForm.tags}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').slice(0, 5).join(',');
                        setUploadForm({...uploadForm, tags});
                      }}
                      className="w-full p-3 border-2 border-navy-dark text-navy-dark"
                      placeholder="e.g., combat, victory, strategy"
                    />
                    <p className="text-sm text-navy-dark/60 mt-1">
                      {uploadForm.tags.split(',').filter(tag => tag.trim()).length}/5 tags
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      type="submit"
                      disabled={uploadLoading || (uploadForm.uploadMethod === 'file' && (!selectedFiles || selectedFiles.length === 0))}
                      className="neo-brutal-button bg-brass text-navy-dark px-6 py-3 disabled:opacity-50"
                    >
                      {uploadLoading ? 'Uploading...' : 'Submit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadForm(false);
                        setSelectedFiles(null);
                        setUploadForm({ type: 'image', url: '', title: '', description: '', tags: '', uploadMethod: 'url' });
                      }}
                      className="neo-brutal-button bg-cannon-smoke text-sail-white px-6 py-3"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Subtle Login Prompt for Non-authenticated Users */}
        {!session && (
          <div className="text-center mb-8">
            <p className="text-navy-dark/70 mb-4" style={{fontFamily: 'Crimson Text, serif'}}>
              <span className="text-brass">⚓</span> Want to share your own naval victories?
              <Link
                href="/api/auth/signin"
                className="text-brass hover:text-brass-bright underline ml-2 font-semibold"
              >
                Join the Fleet
              </Link>
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 loading-anchor">⚓</div>
            <p className="text-navy-dark text-xl" style={{fontFamily: 'Cinzel, serif'}}>
              Charting the Waters...
            </p>
          </div>
        ) : !galleryData || galleryData.items.length === 0 ? (
          <div className="neo-brutal-box max-w-2xl mx-auto p-8 text-center">
            <div className="text-6xl mb-4">🌊</div>
            <h2 className="text-2xl font-bold text-navy-dark mb-4" style={{fontFamily: 'Cinzel, serif'}}>
              {searchTerm ? 'No Battles Found' : 'Calm Seas Ahead'}
            </h2>
            <p className="text-navy-dark" style={{fontFamily: 'Crimson Text, serif'}}>
              {searchTerm
                ? `No battles match "${searchTerm}". Try a different search term.`
                : 'No battles have been recorded yet. Be the first to document your naval victory!'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="neo-brutal-button bg-brass text-navy-dark px-6 py-3 mt-4"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {galleryData.items.map((item) => (
                <div key={item.id} className="neo-brutal-box overflow-hidden gallery-item-hover">
                  {/* Media Display */}
                  <div
                    className="relative aspect-video bg-navy-dark/10 cursor-pointer"
                    onClick={() => {
                      setSelectedMedia({item, type: item.type});
                    }}
                  >
                    {item.type === 'image' ? (
                      <LazyImage
                        src={item.thumbnail || item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg';
                        }}
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <LazyImage
                          src={item.thumbnail || '/placeholder-video.jpg'}
                          alt={`${item.title} - Video thumbnail`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-video.jpg';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-navy-dark/40 hover:bg-navy-dark/60 transition-colors">
                          <div className="bg-brass/90 rounded-full p-4 video-play-button">
                            <svg className="w-8 h-8 text-navy-dark ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Favorite Button - Top Right */}
                    {session?.user && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavorite(item.id);
                        }}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                          userFavorites.has(item.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/80 text-navy-dark hover:bg-brass/80'
                        }`}
                        title={userFavorites.has(item.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {userFavorites.has(item.id) ? '❤️' : '🤍'}
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-navy-dark mb-2" style={{fontFamily: 'Cinzel, serif'}}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-navy-dark/80 mb-4 line-clamp-3" style={{fontFamily: 'Crimson Text, serif'}}>
                        {item.description}
                      </p>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-brass/20 text-navy-dark text-xs border border-brass/40"
                            style={{fontFamily: 'Crimson Text, serif'}}
                          >
                            #{tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="px-2 py-1 bg-navy-dark/10 text-navy-dark text-xs">
                            +{item.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Voting and Stats */}
                    <div className="flex items-center justify-between mb-4">
                      {/* Voting */}
                      {session?.user ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(item.id, 'upvote');
                            }}
                            className={`neo-brutal-button flex items-center gap-1 px-3 py-2 text-sm transition-colors ${
                              userVotes[item.id] === 'upvote'
                                ? 'bg-brass-bright text-navy-dark'
                                : 'bg-sail-white text-navy-dark hover:bg-brass/20'
                            }`}
                          >
                            ▲ {item.upvotes}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(item.id, 'downvote');
                            }}
                            className={`neo-brutal-button flex items-center gap-1 px-3 py-2 text-sm transition-colors ${
                              userVotes[item.id] === 'downvote'
                                ? 'bg-brass-bright text-navy-dark'
                                : 'bg-sail-white text-navy-dark hover:bg-brass/20'
                            }`}
                          >
                            ▼ {item.downvotes}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-navy-dark">
                          <span className="neo-brutal-button bg-sail-white text-navy-dark px-3 py-2">▲ {item.upvotes}</span>
                          <span className="neo-brutal-button bg-sail-white text-navy-dark px-3 py-2">▼ {item.downvotes}</span>
                        </div>
                      )}

                      {/* View Count */}
                      <div className="text-sm text-navy-dark neo-brutal-button bg-sail-white px-3 py-2">
                        {item.viewCount} views
                      </div>
                    </div>

                    {/* Comments Section */}
                    {session?.user && (
                      <div className="border-t border-navy-dark/10 pt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentlyShown = showComments[item.id] || false;
                            setShowComments(prev => ({
                              ...prev,
                              [item.id]: !currentlyShown
                            }));
                            if (!currentlyShown) {
                              loadComments(item.id);
                            }
                          }}
                          className="text-sm text-brass hover:text-brass-bright mb-2"
                        >
                          💬 {(itemComments[item.id] || []).length} comments
                        </button>

                        {showComments[item.id] && (
                          <div className="space-y-2">
                            {/* Existing Comments */}
                            {(itemComments[item.id] || []).map((comment, index) => (
                              <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                                <div className="font-semibold text-navy-dark">{comment.userName}</div>
                                <div className="text-gray-700">{comment.content}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            ))}

                            {/* Add Comment */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 text-sm p-2 border border-gray-300 rounded"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && newComment.trim()) {
                                    e.stopPropagation();
                                    handleComment(item.id, newComment);
                                  }
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (newComment.trim()) {
                                    handleComment(item.id, newComment);
                                  }
                                }}
                                className="text-sm bg-brass text-navy-dark px-3 py-2 rounded hover:bg-brass-bright"
                                disabled={!newComment.trim()}
                              >
                                Post
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm text-brass border-t-2 border-navy-dark/10 pt-4">
                      <div>
                        <span className="font-semibold">Captain {item.uploader}</span>
                      </div>
                      <div>
                        {formatDate(item.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* Modal */}
        {renderModal()}
      </div>
    </div>
  );
}
