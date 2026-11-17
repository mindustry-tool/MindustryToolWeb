'use client';

import dynamic from 'next/dynamic';

const CommentSection = dynamic(() => import('./comment-section'), { ssr: false });

export default CommentSection;