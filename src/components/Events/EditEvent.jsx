import { Link, useNavigate, useParams } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchEvent, updateEvent, queryClient } from "../../util/http.js";

import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const paramsId = useParams();

  const { data, isError, isPending, error } = useQuery({
    queryKey: ["events", paramsId.id],
    queryFn: (signal) => fetchEvent(paramsId, signal),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    // onMutate will be exercuted instantly right before you get back a response from the updating function
    //  it will be called immediately once the mutate function is called.
    onMutate: async (data) => {
      // cancelQueries will only cancel queries triggered by useQuery and not mutation
      // the data passed as a parameter above is the new data, that is supposed to be updated.

      // setQueryData takes two arguement
      // 1. its the key of the event you  want to edit.
      // 2. the second arguement is the new data
      const newEventData = data.event;
      await queryClient.cancelQueries({ queryKey: ["events", paramsId.id] });
      // the use of getQueryData to get the data
      // takes the queryKey as its parameter
      // it gets the previousOld data
      const previousData = queryClient.getQueryData(["events", paramsId.id]);
      queryClient.setQueryData(["events", paramsId.id], newEventData);

      // inorder for the previousData to be part of the context we should return it
      return { previousData };
    },
    //  has callback fun as its property
    // the callBack fun has three parameter
    // 1. error
    // 2. newData
    // 3. context method
    onError: (errror, data, context) => {
      queryClient.setQueryData(["events", paramsId.id], context.previousData);
    },
    // always refetch after error or success
    onSettled: (data) => {
      console.log(data);
      queryClient.invalidateQueries(["events", paramsId.id]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id: paramsId.id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isPending) {
    content = (
      <div className='center'>
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title='Failed to load event'
          message={error.info?.message || "Failed to load the event "}
        />
        <div className='form-actions'>
          <Link to='../' className='button'>
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to='../' className='button-text'>
          Cancel
        </Link>
        <button type='submit' className='button'>
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
