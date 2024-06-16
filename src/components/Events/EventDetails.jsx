import { useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";

import Header from "../Header.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const paramsId = useParams();

  // deleting single event
  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeletion,
    error: DeleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  const handleStartDeleting = () => {
    setIsDeleting(true);
  };

  const handleStopDeleting = () => {
    setIsDeleting(false);
  };

  const handleDeleteEvent = () => {
    mutate({ id: paramsId.id });
  };

  // tanstack fetching single data.

  const { data, error, isError, isPending } = useQuery({
    queryKey: ["events", paramsId.id],
    queryFn: (signal) => fetchEvent(paramsId, signal),
  });

  let content;

  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="An error occurred"
          message={error.info?.message || "Failed to fetch data"}
        />
      </div>
    );
  }

  if (data) {
    const formatedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDeleting}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formatedDate}
                {` @ ${data.time}`}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* modal for deletion */}
      {isDeleting && (
        <Modal onClose={handleStopDeleting}>
          <h1>Are you sure?</h1>
          <p>Do you really want to delete this event?</p>
          <div className="form-actions">
            {isPendingDeletion && <p>Deleting the event.....Please wait!!</p>}
            {!isPendingDeletion && (
              <>
                <button onClick={handleStopDeleting} className="button-text">
                  Dancel
                </button>
                <button onClick={handleDeleteEvent} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeletion && (
            <ErrorBlock
              title="Failed to delete"
              message={
                DeleteError.info?.message || "Failed to delete the event "
              }
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
