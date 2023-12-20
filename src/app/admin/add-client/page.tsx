"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import questionsList from "../../_utils/questionsList";

import { FaPlus } from "react-icons/fa";

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
    setIsLoading(false);
  };

  const addProjectDir = async () => {
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

  return (
    <div className="add-client-main">
      <div className="add-client-modal">
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
              <div key={property}>
                <label>{label}</label>
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
        <button type="button" onClick={() => changeQuestions(1)}>
          Next
        </button>
        <button type="button" onClick={() => changeQuestions(-1)}>
          Prev
        </button>
        <button type="button" onClick={() => handleSubmit()}>
          Submit
        </button>
        <button type="button" onClick={() => addProjectDir()}>
          Add Dir
        </button>
        <button type="button" onClick={() => addUser()}>
          Add Auth
        </button>
      </div>
    </div>
  );
}
