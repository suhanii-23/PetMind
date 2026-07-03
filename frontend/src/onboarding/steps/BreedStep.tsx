import { useState } from "react";
import type { OnboardingData } from "../onboarding.types";
import SearchableSelect from "../components/SearchableSelect";
import styles from "../Onboarding.module.css";

const DOG_BREEDS = ["Labrador Retriever","Golden Retriever","German Shepherd","French Bulldog","Bulldog","Poodle","Beagle","Rottweiler","Yorkshire Terrier","Dachshund","Siberian Husky","Doberman","Great Dane","Shih Tzu","Boxer","Border Collie","Australian Shepherd","Maltese","Chihuahua","Pomeranian","Mixed Breed","Other"];
const CAT_BREEDS = ["Persian","Maine Coon","Siamese","Ragdoll","British Shorthair","Abyssinian","Sphynx","Russian Blue","Bengal","Scottish Fold","Mixed Breed","Other"];
const RABBIT_BREEDS = ["Holland Lop","Mini Rex","Netherland Dwarf","Lionhead","Dutch","Flemish Giant","Mini Lop","Angora","Mixed Breed","Other"];

function getBreeds(species: string) {
  if (species === "Dog") return DOG_BREEDS;
  if (species === "Cat") return CAT_BREEDS;
  if (species === "Rabbit") return RABBIT_BREEDS;
  return [];
}

interface Props { data: OnboardingData; onNext: (u: Partial<OnboardingData>) => void; }

export default function BreedStep({ data, onNext }: Props) {
  const [breed, setBreed] = useState(data.breed);
  const breeds = getBreeds(data.species);

  return (
    <>
      <h2 className={styles.question}>What breed is {data.name}?</h2>
      <p className={styles.subtext}>Search or type a custom breed</p>
      {breeds.length > 0
        ? <SearchableSelect options={breeds} value={breed} onChange={setBreed} placeholder="Search breeds…" />
        : (
          <input
            className={styles.textInput}
            value={breed}
            onChange={e => setBreed(e.target.value)}
            placeholder="Enter breed"
            autoFocus
          />
        )}
      <button className={styles.continueBtn} disabled={!breed.trim()} onClick={() => onNext({ breed: breed.trim() })}>
        Continue
      </button>
      <button className={styles.skipBtn} onClick={() => onNext({ breed: "Mixed / Unknown" })}>
        Mixed / Unknown
      </button>
    </>
  );
}
