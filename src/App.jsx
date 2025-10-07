import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const CURRENT_USER = "Guest User (You)";

const initialPostState = () => {
    const savedPosts = localStorage.getItem('mini_social_posts');
    return savedPosts ? JSON.parse(savedPosts) : [];
};

// 💡 नया: फीडबैक मैसेज कंपोनेंट
const FeedbackMessage = ({ message }) => {
    if (!message) return null;
    return (
        <div className="feedback-message">
            {message} 
        </div>
    );
};

function App() {
    const [posts, setPosts] = useState(initialPostState);
    const [postText, setPostText] = useState("");
    const [commentText, setCommentText] = useState({});
    const [sortBy, setSortBy] = useState("recent");
    const [newlyAddedPostId, setNewlyAddedPostId] = useState(null);  
    const [newlyAddedCommentId, setNewlyAddedCommentId] = useState(null);  
    // 💡 नया स्टेट: सफलता संदेश दिखाने के लिए
    const [feedbackMessage, setFeedbackMessage] = useState(null); 


    // Local Storage
    useEffect(() => {
        localStorage.setItem('mini_social_posts', JSON.stringify(posts));
    }, [posts]);

    // Sorting Logic (unchanged)
    const getSortedPosts = useCallback(() => {
        let sortedPosts = [...posts];
        if (sortBy === 'liked') {
            sortedPosts.sort((a, b) => b.likes - a.likes);
        } else {
            sortedPosts.sort((a, b) => b.id - a.id);
        }
        return sortedPosts;
    }, [posts, sortBy]);


    // 💡 नया: मैसेज दिखाने और हटाने का फ़ंक्शन
    const showFeedback = (message) => {
        setFeedbackMessage(message);
        setTimeout(() => {
            setFeedbackMessage(null);
        }, 3000); // 3 सेकंड बाद संदेश हटा दें
    };


    // Post Logic
    const addPost = () => {
        if (postText.trim() === "") return;
        
        const newPost = {
            id: Date.now(),
            text: postText,
            likes: 0,
            user: CURRENT_USER,
            timestamp: new Date().toLocaleString(),
            comments: [],
            isNew: true,  
        };
        
        setPosts([newPost, ...posts]);
        setPostText("");
        setNewlyAddedPostId(newPost.id);  
        
        showFeedback("✅ Post created successfully!"); // 💡 सफलता संदेश

        setTimeout(() => {
            setNewlyAddedPostId(null);
        }, 500);  
    };

    const likePost = (id) => {
        setPosts(posts.map(post => 
            post.id === id ? { ...post, likes: post.likes + 1 } : post
        ));
    };

    const deletePost = (id) => {
        setPosts(posts.filter(post => post.id !== id));
        showFeedback("🗑️ Post deleted."); // 💡 सफलता संदेश
    };


 
    const addComment = (postId) => {
        const text = commentText[postId] || '';
        if (text.trim() === "") return;

        const newComment = {
            id: Date.now(),
            text: text,
            user: "Commenter", 
            timestamp: new Date().toLocaleTimeString(),
            isNew: true,  
        };

        setPosts(posts.map(post => 
            post.id === postId
                ? { ...post, comments: [...post.comments, newComment] } 
                : post
        ));
        
        setCommentText(prev => ({ ...prev, [postId]: '' }));
        setNewlyAddedCommentId(newComment.id);  
        
        showFeedback("💬 Comment added successfully!"); // 💡 सफलता संदेश

          
        setTimeout(() => {
            setNewlyAddedCommentId(null);
        }, 500);  
    };

    const handleCommentChange = (postId, value) => {
        setCommentText(prev => ({ ...prev, [postId]: value }));
    };

    const sortedPosts = getSortedPosts();


    return (
        <div className="App">
            
            {/* 💡 फीडबैक मैसेज को सबसे ऊपर दिखाएं */}
            <FeedbackMessage message={feedbackMessage} /> 

            <h2>Mini Social Media App</h2>
            
            <div className="profile-info">Posting as: <b>{CURRENT_USER}</b></div>

        
            <div className="post-input-container">
                <input
                    type="text"
                    placeholder="What's on your mind?"
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') addPost(); }}
                />
                <button 
                    onClick={addPost}
                    disabled={postText.trim() === ""}
                >
                    Post
                </button>
            </div>
            
          
            <div className="sorting-control">
                Sort By: 
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="recent">Most Recent</option>
                    <option value="liked">Most Liked</option>
                </select>
            </div>
            
          
            <div className="posts">
                {sortedPosts.map(post => (
                    <div 
                        key={post.id} 
                        className={`post ${post.id === newlyAddedPostId ? 'fade-in' : ''}`}  
                    >
                      
                        <div className="post-header">
                            <span className="post-user">{post.user}</span>
                            <span className="timestamp">{post.timestamp}</span>
                        </div>
                        <p className="post-text">{post.text}</p>
                        
                        <div className="post-actions">
                            <button onClick={() => likePost(post.id)} className="like-btn">
                                👍 Like ({post.likes})
                            </button>
                            <button onClick={() => deletePost(post.id)} className="delete-btn">
                                🗑️ Delete
                            </button>
                        </div>

                    
                        <div className="comments-section">
                            <h4>Comments ({post.comments.length})</h4>
                            
                       
                            <div className="comment-input-area">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={commentText[post.id] || ''}
                                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                    onKeyPress={(e) => { if (e.key === 'Enter') addComment(post.id); }}
                                />
                                <button onClick={() => addComment(post.id)} disabled={!commentText[post.id] || commentText[post.id].trim() === ""}>
                                    Send
                                </button>
                            </div>

                     
                            <div className="comment-list">
                                {post.comments.map(comment => (
                                    <div 
                                        key={comment.id} 
                                        className={`comment-item ${comment.id === newlyAddedCommentId ? 'fade-in' : ''}`}  
                                    >
                                        <b>{comment.user}</b>: {comment.text}
                                        <span className="comment-time"> ({comment.timestamp})</span>
                                    </div>
                                ))}
                            </div>
                        </div> 
                    </div>
                ))}
                
                {posts.length === 0 && (
                  <p className="no-posts">No Post</p>
                )}
            </div>
        </div>
    );
}

export default App;