import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { createNewEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { queryClient } from "../../util/http.js";

export default function NewEvent() {
  const navigate = useNavigate();

  const { mutate, isError, error, isPending } = useMutation({
    mutationFn: createNewEvent,
    // the code below will wait the request to finish before moving to another page.
    onSuccess: () => {
      // this is used to make the data to be retched after a successful data submission
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate("/events");
    },
  });

  // the mutate fun from useMutation is used to call the request that send data to the backend
  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate("../")}>
      <EventForm onSubmit={handleSubmit}>
        <>
          {isPending && (
            <button type='submit' className='button'>
              Submitting...
            </button>
          )}
          {!isPending && (
            <>
              <Link to='../' className='button-text'>
                Cancel
              </Link>
              <button type='submit' className='button'>
                Create
              </button>
            </>
          )}
        </>
      </EventForm>
      {isError && (
        <ErrorBlock
          title='Failed to create'
          message={error.info?.message || "Failed to create the event "}
        />
      )}
    </Modal>
  );
}

// mutate property from the useMutation is used to intiate the sending of request.
