"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import questionsList from "../../_utils/questionsList";

import { FaPlus } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa";
import { FaChevronLeft } from "react-icons/fa";

import "./style.css";

type UserDataItem = {
  name: string;
  username: string;
  password: string;
  email: string;
  subscription: string;
  admin: boolean;
  best_time: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
};
type ProjectDataItem = {
  project_id: number | null;
  user_id: number | null;
  root_dir: number | null;
  name: string;
  redesign: string;
  new_domain: string;
  new_host: string;
  deadline: string;
  maintain_updates: string;
  budget: string;
  main_purpose: string;
  audience: string;
  total_pages: string;
  payments: string;
  corporate_images: string;
  photos: string;
  writing_typing: string;
  example_sites: string;
  functionality: string;
};

export default function AddClient() {
  const [userData, setUserData] = useState<UserDataItem>({
    name: "",
    username: "",
    password: "password123!",
    email: "",
    subscription: "Free",
    admin: false,
    best_time: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });
  const [projectData, setProjectData] = useState<ProjectDataItem>({
    project_id: null,
    user_id: null,
    root_dir: null,
    name: "",
    redesign: "",
    new_domain: "",
    new_host: "",
    deadline: "",
    maintain_updates: "",
    budget: "",
    main_purpose: "",
    audience: "",
    total_pages: "",
    payments: "",
    corporate_images: "",
    photos: "",
    writing_typing: "",
    example_sites: "",
    functionality: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newDirId, setNewDirId] = useState(0);
  const [parentDir, setParentDir] = useState(0);
  const [parentProject, setParentProject] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userCreated, setUserCreated] = useState(false);
  const [dirCreated, setDirCreated] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const changeQuestions = (value: number) => {
    console.log(userData);
    if (currentQuestion + value < 0) {
      return;
    }
    if (currentQuestion + value > questionsList.length - 1) {
      return;
    }
    setCurrentQuestion(currentQuestion + value);
  };

  const addUser = async () => {
    setIsLoading(true);
    const signUpResponse = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: `${location.origin}/callback`,
      },
    });

    if (signUpResponse.error) {
      alert("Error during sign up");
      console.error("Error during sign up: ", signUpResponse.error.message);
      return;
    }
    router.replace("/login");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const { password, ...userDataWithoutPassword } = userData;
    const { error: addUserError } = await supabase
      .from("users")
      .insert(userDataWithoutPassword);

    if (addUserError) {
      console.error("An error occured adding user to tables: ", addUserError);
      setIsLoading(false);
      return;
    }
    const { data: maxDirIdData, error: maxDirIdError } = await supabase
      .from("directories")
      .select("dir_id")
      .order("dir_id", { ascending: false })
      .limit(1);

    if (maxDirIdError) {
      console.error(maxDirIdError);
      setIsLoading(false);
      return;
    }
    const { data: maxProjectIdData, error: maxProjectIdError } = await supabase
      .from("projects")
      .select("project_id")
      .order("project_id", { ascending: false })
      .limit(1);

    if (maxProjectIdError) {
      console.error(maxProjectIdError);
      setIsLoading(false);
      return;
    }

    const { data: userId, error: userIdError } = await supabase
      .from("users")
      .select("client_id")
      .eq("email", userData.email);

    if (userIdError) {
      console.error(userIdError);
      setIsLoading(false);
      return;
    }

    const newDirId = maxDirIdData.length > 0 ? maxDirIdData[0].dir_id + 1 : 1;
    const newProjectId =
      maxProjectIdData.length > 0 ? maxProjectIdData[0].project_id + 1 : 1;

    const dirInfo = {
      dir_id: newDirId,
      project: newProjectId,
      parent_dir: null,
      name: `${userData.username} Web App`,
    };

    setProjectData((prevProjectData) => ({
      ...prevProjectData,
      project_id: newProjectId,
      user_id: userId[0].client_id,
    }));

    const fullData = projectData;
    fullData.project_id = newProjectId;
    fullData.user_id = userId[0].client_id;
    fullData.name = `${userData.username} Web Client`;

    const { error } = await supabase.from("projects").insert(fullData);

    if (error) {
      console.error(error);
      setIsLoading(false);
      return;
    }

    const { error: dirInsertError } = await supabase
      .from("directories")
      .insert(dirInfo);

    if (dirInsertError) {
      console.error(dirInsertError);
      setIsLoading(false);
      return;
    }

    const { error: updateProjectError } = await supabase
      .from("projects")
      .update({ root_dir: newDirId })
      .eq("project_id", newProjectId);

    if (updateProjectError) {
      console.error(updateProjectError);
      setIsLoading(false);
      return;
    }

    setParentDir(newDirId);
    setNewDirId(newDirId + 1);
    setParentProject(newProjectId);
    setUserCreated(true);
    setIsLoading(false);
  };

  const addProjectDir = async () => {
    setIsLoading(true);
    const newDir = {
      dir_id: newDirId,
      parent_dir: parentDir,
      project: parentProject,
      name: "Project Files",
    };

    const { error: addDirError } = await supabase
      .from("directories")
      .insert(newDir);

    if (addDirError) {
      console.error(addDirError);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    setDirCreated(true);
  };

  function getSafeValue<T extends object, K extends keyof T>(
    obj: T,
    key: K | undefined
  ): string {
    if (key === undefined || !(key in obj)) {
      return "";
    }
    const value = obj[key];

    // Check the type of value and convert accordingly
    if (typeof value === "string") {
      return value;
    } else if (typeof value === "number" || typeof value === "boolean") {
      return value.toString();
    } else {
      return "";
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      const session = await supabase.auth.getSession();

      if (!session.data.session) {
        // If there's no session, redirect to login or home page
        router.replace("/login");
        return;
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("admin")
        .eq("email", session.data.session.user.email)
        .single();

      if (error || !user || !user.admin) {
        // If there's an error, or user is not admin, redirect to not allowed page
        router.replace("/");
      }
    };
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  return (
    <div className="add-client-main">
      <h2>Add New Client</h2>
      <div className="add-client-modal">
        {isLoading && (
          <div className="loader-container">
            <span className="loader"></span>
          </div>
        )}
        {questionsList[currentQuestion].map((question) => {
          const { label, property, placeholder, table } = question;
          if (property !== undefined) {
            const update = (value: string) => {
              if (table === "users") {
                setUserData((prevUserData) => ({
                  ...prevUserData,
                  [property]: value,
                }));
              } else {
                setProjectData((prevProjectData) => ({
                  ...prevProjectData,
                  [property]: value,
                }));
              }
            };
            return (
              <div key={property} className="add-client-question">
                <label style={{ whiteSpace: "pre-line" }}>{label}</label>
                <input
                  type="text"
                  value={getSafeValue(userData, property as keyof UserDataItem)}
                  onChange={(e) => update(e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            );
          }
        })}
        {currentQuestion < questionsList.length - 1 && (
          <div className="new-client-next" onClick={() => changeQuestions(1)}>
            Next Question <FaChevronRight />
          </div>
        )}
        {currentQuestion !== 0 && (
          <div className="new-client-prev" onClick={() => changeQuestions(-1)}>
            <FaChevronLeft /> Prev Question
          </div>
        )}
        {currentQuestion >= questionsList.length - 1 && !userCreated && (
          <button
            type="button"
            disabled={isLoading}
            className="new-client-submit"
            onClick={() => handleSubmit()}
          >
            Create User
          </button>
        )}
        {userCreated && !dirCreated && (
          <button
            type="button"
            disabled={isLoading}
            className="new-client-add-dir"
            onClick={() => addProjectDir()}
          >
            Add Folders
          </button>
        )}
        {dirCreated && (
          <button
            type="button"
            disabled={isLoading}
            className="new-client-auth"
            onClick={() => addUser()}
            style={{ backgroundColor: "#63c6ae" }}
          >
            Send Auth Email
          </button>
        )}
      </div>
    </div>
  );
}
