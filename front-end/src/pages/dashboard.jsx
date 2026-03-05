import React from "react";
import { useForm } from "react-hook-form";

import Button from "./../components/ui/button";
import Input from "./../components/ui/input";
import Textarea from "./../components/ui/textarea";
import ProductsList from "./../features/productsList";

function dashboard() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <>
      <section className="sectionDashboard">
        <div className="mainBloc">
          <ProductsList />
        </div>
        <div className="sideBloc">
          <form onSubmit={handleSubmit((data) => console.log(data))} className="flex flex-col gap-4 text-sm">
            <Input type="text" label="Nom" register={register("name", { required: "Ce champ est requis" })} errors={errors} />
            <Input type="text" register={register("email")} errors={errors} />
            <Textarea />
            <Button label="Soumettre" variant="primary" size="default" type="submit" />
          </form>
        </div>
        {/* #b0bbb7 */}
      </section>
    </>
  );
}

export default dashboard;
