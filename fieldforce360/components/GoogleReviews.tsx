import React from 'react';

const GoogleReviews = () => {
    const reviews = [
        {
            id: 1,
            author: "John Doe",
            rating: 5,
            text: "Excellent service! Highly recommend.",
        },
        {
            id: 2,
            author: "Jane Smith",
            rating: 4,
            text: "Very good experience, will use again.",
        },
        {
            id: 3,
            author: "Alice Johnson",
            rating: 5,
            text: "Outstanding support and quality.",
        },
        {
            id: 4,
            author: "Bob Brown",
            rating: 3,
            text: "Average service, could be better.",
        },
    ];

    return (
        <div className="google-reviews">
            <h2>Google Reviews</h2>
            <ul>
                {reviews.map(review => (
                    <li key={review.id}>
                        <h3>{review.author} - {review.rating} Stars</h3>
                        <p>{review.text}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GoogleReviews;