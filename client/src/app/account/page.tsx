/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { useForm } from "react-hook-form";
import { Loading } from "~/components";
import { useMe, useUpdateUser } from "~/hooks";

type Inputs = {
  firstName: string;
  lastName: string;
  email: string;
};

export default function AccountPage() {
  const { me } = useMe();
  const { mutate } = useUpdateUser();
  const {
    register,
    handleSubmit,
    formState: { isDirty, isSubmitting, isValid, errors },
  } = useForm<Inputs>({
    defaultValues: {
      firstName: me?.firstName,
      lastName: me?.lastName,
      email: me?.email,
    },
  });

  const onSubmit = (data) => {
    mutate(
      { ...data, id: me?.id },
      {
        onSuccess: () => {},
      },
    );
  };

  const isSubmitDisabled = isSubmitting || !isDirty || !isValid;

  return (
    <>
      {/* Settings forms */}
      <div className="divide-y divide-white/5">
        <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-white">
              Personal Information
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Use a permanent address where you can receive mail.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="md:col-span-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:max-w-xl sm:grid-cols-6">
              <div className="col-span-full flex items-center gap-x-8">
                <img
                  alt=""
                  src={me?.picture}
                  className="h-24 w-24 flex-none rounded-lg bg-gray-800 object-cover"
                />
                <div>
                  <button
                    disabled
                    type="button"
                    className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-white/20 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-400"
                  >
                    Change avatar
                  </button>
                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    JPG, GIF or PNG. 1MB max.
                  </p>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  First name
                </label>
                <div className="mt-2">
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                  />
                  {errors.firstName && (
                    <p className="p-2 text-red-600" role="alert">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Last name
                </label>
                <div className="mt-2">
                  <input
                    id="last-name"
                    type="text"
                    autoComplete="family-name"
                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    {...register("lastName", { required: true })}
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    disabled
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-400 sm:text-sm sm:leading-6"
                    {...register("email", { required: true })}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex">
              <button
                disabled={isSubmitDisabled}
                type="submit"
                className="flex rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-500/50 disabled:text-white/50"
              >
                Save
                {isSubmitting ? <Loading /> : null}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
